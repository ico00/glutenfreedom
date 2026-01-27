import { NextResponse } from "next/server";
import { Logger } from "./logger";

export interface IAppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

/**
 * Custom error klasa za aplikacijske greške
 */
export class AppError extends Error implements IAppError {
  statusCode: number;
  code: string;
  isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    isOperational: boolean = true
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Standardizirani error response
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = "An error occurred"
): NextResponse {
  let statusCode = 500;
  let message = defaultMessage;
  let code = "INTERNAL_ERROR";

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
  } else if (error instanceof Error) {
    message = error.message || defaultMessage;
  }

  // Ne logiraj operacijske greške (npr. validation errors)
  if (!(error instanceof AppError) || error.statusCode >= 500) {
    Logger.error("API Error", error, {
      statusCode,
      code,
    }).catch(console.error);
  }

  return NextResponse.json(
    {
      message,
      code,
      ...(process.env.NODE_ENV === "development" && {
        stack: error instanceof Error ? error.stack : undefined,
      }),
    },
    { status: statusCode }
  );
}

/**
 * Wrapper za async API route handlers s error handling
 */
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return createErrorResponse(error);
    }
  };
}

/**
 * Validacija error - za validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string, public fields?: Record<string, string[]>) {
    super(message, 400, "VALIDATION_ERROR", true);
    this.name = "ValidationError";
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication required") {
    super(message, 401, "AUTHENTICATION_ERROR", true);
    this.name = "AuthenticationError";
  }
}

/**
 * Authorization error
 */
export class AuthorizationError extends AppError {
  constructor(message: string = "Insufficient permissions") {
    super(message, 403, "AUTHORIZATION_ERROR", true);
    this.name = "AuthorizationError";
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND", true);
    this.name = "NotFoundError";
  }
}

