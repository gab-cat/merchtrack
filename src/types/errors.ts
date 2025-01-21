export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    console.error(this.message);
    console.error(this.stack);
  }
}

export class PrismaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrismaError';
    console.error(this.message);
    console.error(this.stack);
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
    console.error(this.message);
    console.error(this.stack);
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
    console.error(this.message);
    console.error(this.stack);
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
    console.error(this.message);
    console.error(this.stack);
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
    console.error(this.message);
    console.error(this.stack);
  }
}


