import { toast } from "sonner";
import {
  ValidationError,
  PrismaError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
} from "@/types/errors";
import useToast from "@/hooks/use-toast";

type WrapperOptions = {
  // no-dd-sa:typescript-best-practices/boolean-prop-naming
  showSuccessToast?: boolean;
  successMessage?: string;
  sucessTitle?: string;
};

export const clientWrapper = <T>(fn: () => Promise<T>, options: WrapperOptions = {}) => {
  return async () => {
    try {
      const result = await fn();
      if (options.showSuccessToast) {
        useToast({
          type: "success",
          title: options.sucessTitle ?? "Success",
          message: options.successMessage ?? "Operation completed successfully",
        });
      }
      
      return result;
    } catch (error: unknown) {
      let statusCode = 500;
      let message = "An unexpected error occurred";

      // Check error type by code/name property
      // @ts-expect-error - error is unknown
      switch (error?.code || error?.name) {
      case 'ValidationError':
        statusCode = 400;
        message = (error as ValidationError).message;
        toast.error(`Validation Error: ${message}`);
        break;

      case 'PrismaError':
        statusCode = 409; // Conflict status code
        message = (error as PrismaError).message;
        toast.error(message);
        break;

      case error instanceof AuthenticationError:
        statusCode = 401;
        message = (error as AuthenticationError).message;
        toast.error("Authentication failed. Please login again.");
        break;

      case error instanceof AuthorizationError:
        statusCode = 403;
        message = (error as AuthorizationError).message;
        toast.error("You don't have permission to perform this action");
        break;

      case error instanceof NotFoundError:
        statusCode = 404;
        message = (error as NotFoundError).message;
        toast.error(message);
        break;

      case error instanceof DatabaseError:
        message = "Database operation failed";
        toast.error("A database error occurred. Please try again later.");
        break;

      default:
        toast.error((error as Error).message);
      }

      // For server-side actions, throw an error that Next.js can handle
      if (typeof window === 'undefined') {
        throw new Error(message);
      }

      // For client-side actions, return an error object
      return {
        success: false,
        error: true,
        statusCode,
        message,
      };
    }
  };
};

// Usage example:
// const myAction = wrapper(async (data) => {
//   // Your action logic here
// }, { showSuccessToast: true, successMessage: "Operation completed successfully" });