import { z } from "zod";

// ResponseStatus ---------------------------------------------------

export const UserResponseStatusSchema = z.enum(["in progress", "completed"]);

/**
 * A string representation of a user's progress in a given input fragment.
 */
export type UserResponseStatus = z.infer<typeof UserResponseStatusSchema>;

// UserResponse -----------------------------------------------------

export const UserResponseSchema = z
  .object({
    fragmentUri: z.string(),
    value: z.any(),
    status: UserResponseStatusSchema.optional(),
  })
  .strict();

/**
 * The user state of a given fragment.
 */
export type UserResponse = z.infer<typeof UserResponseSchema>;

// NewUserResponse --------------------------------------------------

export const NewUserResponseSchema = z
  .object({
    enrollmentId: z.number(),
    fragmentUri: z.string(),
    value: z.any(),
    status: UserResponseStatusSchema,
  })
  .strict();

/**
 * A new user state for a given fragment that has not yet been stored or retrieved.
 */
export type NewUserResponse = z.infer<typeof NewUserResponseSchema>;
