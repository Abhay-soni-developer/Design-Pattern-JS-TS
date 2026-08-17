export interface IUserRepository {
  getById(userId: string): Promise<User>;
  updateUser(
    userId: string,
    updatedUserFields: Omit<User, "id">,
  ): Promise<User>;
}

export interface User {
  id: string;
  name: string;
  age: number;
}

export const userCollection = new Map<string, User>();

export class UserRepository implements IUserRepository {
  constructor(private readonly userCollection: Map<string, User>) {}

  getById(userId: string): Promise<User> {
    const user = this.userCollection.get(userId);

    if (user === undefined) {
      throw new UserNotFound(userId);
    }

    return Promise.resolve(user);
  }

  async updateUser(
    userId: string,
    updatedUserFields: Omit<User, "id">,
  ): Promise<User> {
    const user = await this.getById(userId);
    const updatedUser = { ...user, ...updatedUserFields };
    this.userCollection.set(userId, updatedUser);
    return Promise.resolve(updatedUser);
  }
}

type CacheRecord<T> = {
  status: "FOUND" | "NOT_FOUND";
  expiresAt: number;
} & (
  | {
      status: "FOUND";
      value: T;
    }
  | {
      status: "NOT_FOUND";
      value: null;
    }
);

type UserCacheRecord = CacheRecord<User>;

export class CachedUserRepository implements IUserRepository {
  private userCacheRepo = new Map<string, UserCacheRecord>();
  private userPendingRepo = new Map<string, Promise<User>>();
  private cacheVersionRegistry = new Map<string, number>();

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly ttlMs: number = 5 * 60 * 1000,
  ) {}

  async getById(userId: string): Promise<User> {
    try {
      const cachedUser = this.userCacheRepo.get(userId);

      if (
        cachedUser &&
        cachedUser.status === "NOT_FOUND" &&
        cachedUser.expiresAt > Date.now()
      ) {
        throw new UserNotFound(userId);
      }

      if (
        cachedUser &&
        cachedUser.status === "FOUND" &&
        cachedUser.expiresAt > Date.now()
      ) {
        return cachedUser.value;
      }

      const pendingUserPromise = this.userPendingRepo.get(userId);
      
      if (pendingUserPromise) {
        return pendingUserPromise;
      }

      const cacheVersion = this.cacheVersionRegistry.get(userId) ?? 0;
      const pendingUser = this.userRepository.getById(userId);

      pendingUser.then((user) => this.commitUserToCache(user, cacheVersion));
      return pendingUser;
    } catch (err) {
      if (err instanceof UserNotFound) {
        this.userCacheRepo.set(userId, {
          status: "NOT_FOUND",
          value: null,
          expiresAt: Date.now() + this.ttlMs,
        });
      }
      console.log("error", err);
    }
  }

  updateUser(
    userId: string,
    updatedUserFields: Omit<User, "id">,
  ): Promise<User> {
    const cacheUserVersion = this.cacheVersionRegistry.get(userId) ?? 0;
    const updateUserPromise = this.userRepository.updateUser(
      userId,
      updatedUserFields,
    );

    this.userPendingRepo.set(userId, updateUserPromise);

    updateUserPromise
      .then((user) => this.commitUserToCache(user, cacheUserVersion))
      .catch((err) => {
        if (err instanceof UserNotFound) {
          this.userCacheRepo.set(userId, {
            status: "NOT_FOUND",
            value: null,
            expiresAt: Date.now() + this.ttlMs,
          });
        }
        console.log(err);
      });

    return updateUserPromise;
  }

  private commitUserToCache(user: User, oldCacheVersion: number): void {
    const latestCacheUserVersion = this.cacheVersionRegistry.get(user.id) ?? 0;

    if (oldCacheVersion !== latestCacheUserVersion) return;
    this.userCacheRepo.set(user.id, {
      status: "FOUND",
      value: user,
      expiresAt: Date.now() + this.ttlMs,
    });

    this.cacheVersionRegistry.set(user.id, latestCacheUserVersion + 1);
    this.userPendingRepo.delete(user.id);
  }
}

export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class UserNotFound extends UserError {
  constructor(userId: string) {
    super(`user with id: ${userId} not found`);
  }
}
