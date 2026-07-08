import type { Response } from "express";
import type { ZodError } from "zod";


export function sendValidationError(res: Response, e: ZodError<any>): void {
  res.status(400).json({
    error: "validation_error",
    issues: e.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    })),
  });
}
