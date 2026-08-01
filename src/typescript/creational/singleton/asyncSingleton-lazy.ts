class DatabaseClientSingleton {
  private static instance?: DatabaseClientSingleton;
  private static pending?: Promise<DatabaseClientSingleton>;
  private static connectionAttempts: number = 0;
  private constructor() {}

  private static connect(): Promise<DatabaseClientSingleton> {
    return new Promise((resolve, _reject) => {
      setTimeout(() => {
        DatabaseClientSingleton.connectionAttempts =
          DatabaseClientSingleton.connectionAttempts++;
        resolve(new DatabaseClientSingleton());
      }, 2000);
    });
  }

  static async getInstance(): Promise<DatabaseClientSingleton> {
    try {
      if (DatabaseClientSingleton.instance) {
        return DatabaseClientSingleton.instance;
      }

      if (DatabaseClientSingleton.pending) {
        return DatabaseClientSingleton.pending;
      }

      DatabaseClientSingleton.pending = DatabaseClientSingleton.connect();
      return DatabaseClientSingleton.pending;
    } catch (err) {
      throw Error("something unexpected occured");
    }
  }

  static getConnectionAttempts() {
    return this.connectionAttempts;
  }
}

const [db1, db2, db3] = await Promise.all([
  DatabaseClientSingleton.getInstance(),
  DatabaseClientSingleton.getInstance(),
  DatabaseClientSingleton.getInstance(),
]);

console.log(db1 === db2);
console.log(db2 === db3);
console.log(DatabaseClientSingleton.getConnectionAttempts());
