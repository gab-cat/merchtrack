class CustomError extends Error {
  code: string;

  constructor(message: string, name: string) {
    super(message);
    this.name = name;
    this.code = name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends CustomError {
  constructor(message: string) {
    super(message, 'ValidationError');
  }
}

export class PrismaError extends CustomError {
  constructor(message: string, stack?: string) {
    super(message, 'PrismaError');
    this.stack = stack;
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string) {
    super(message, 'AuthenticationError');
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string) {
    super(message, 'AuthorizationError');
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string) {
    super(message, 'NotFoundError');
  }
}

export class DatabaseError extends CustomError {
  constructor(message: string) {
    super(message, 'DatabaseError');
  }
}


