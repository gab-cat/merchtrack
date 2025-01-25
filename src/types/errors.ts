class CustomError extends Error {
  code: string;

  constructor(message: string, name: string) {
    super(message);
    this.name = name;
    this.code = name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// no-dd-sa:typescript-best-practices/no-unnecessary-class
export class ValidationError extends CustomError {
  constructor(message: string) {
    super(message, 'ValidationError');
  }
}

export class PrismaError extends CustomError {  
  constructor(message: string, stack?: string) {  
    super(message, 'PrismaError');  
    this.stack = stack ?? this.stack;  
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


