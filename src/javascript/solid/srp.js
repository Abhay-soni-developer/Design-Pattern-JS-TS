// Bad Example

// This class handles:

// validation
// database persistence
// email sending
// logging

// It has multiple reasons to change.

class UserService {
  async registerUser(userData) {
    if (!userData.email.includes("@")) {
      throw new Error("Invalid email");
    }

    const user = await database.users.insert(userData);

    await emailProvider.send({
      to: user.email,
      subject: "Welcome",
    });

    console.log("User registered:", user.id);

    return user;
  }
}

// Each class has one responsibility:

// UserValidator → validation
// UserRepository → persistence
// EmailService → email delivery
// UserRegistrationService → registration workflow

class UserValidator {
  validate(userData) {
    if (!userData.email.includes("@")) {
      throw new Error("Invalid email");
    }
  }
}

class UserRepository {
  async create(userData) {
    return database.users.insert(userData);
  }
}

class EmailService {
  async sendWelcomeEmail(user) {
    return emailProvider.send({
      to: user.email,
      subject: "Welcome",
    });
  }
}

class UserRegistrationService {
  constructor(validator, repository, emailService) {
    this.validator = validator;
    this.repository = repository;
    this.emailService = emailService;
  }

  async register(userData) {
    this.validator.validate(userData);

    const user = await this.repository.create(userData);

    await this.emailService.sendWelcomeEmail(user);

    return user;
  }
}