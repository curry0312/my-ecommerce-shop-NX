export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;
  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.name = "AppError";
    Error.captureStackTrace(this);
  }
}

//Not found error
export class NotFoundError extends AppError {
  constructor(message = "Resource Not found") {
    super(message, 404);
  }
}

//validation Error (user for Joi/zod/react-hook-form validation errors)
export class ValidationError extends AppError {
    constructor(message = "Invalid request data", details?: any) {
      super(message, 400, true, details);
    }
}

//Authentication Error
export class AuthError extends AppError {
  constructor(message = "Authentication Error") {
    super(message, 401);
  }
}

//Forbidden Error (For Insufficient Permissions)
export class ForbiddenError extends AppError {
    constructor(message = "Forbidden access") {
        super(message, 403);
    }
}

//Database Error
export class DatabaseError extends AppError {
    constructor(message = "Database Error", details?: any) {
        super(message, 500, true, details);
    }
}

