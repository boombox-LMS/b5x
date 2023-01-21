import { z } from "zod";

// NewUser ----------------------------------------------------------

export const NewUserSchema = z
  .object({
    email: z.string().email(),
    username: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  })
  .strict();

/**
 * A newly built user that has not yet been stored or retrieved.
 */
export type NewUser = z.infer<typeof NewUserSchema>;

// SavedUser --------------------------------------------------------

export const SavedUserSchema = z
  .object({
    id: z.number(),
    email: z.string().email(),
    username: z.string(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .strict();

/**
 * The user data as it is stored on disk.
 */
export type SavedUser = z.infer<typeof SavedUserSchema>;

// ActivityMap ------------------------------------------------------

export const ActivityMapSchema = z.record(z.string(), z.number());

/**
 * A representation of the user's daily event count over a span of x days.
 */
export type ActivityMap = z.infer<typeof ActivityMapSchema>;

// UserProfile ------------------------------------------------------

export const UserProfileSchema = z.object({
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  username: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// UserWithGroupModifications ---------------------------------------

export const UserWithGroupModificationsSchema = z.object({
  email: z.string().email(),
  addToGroups: z.array(z.string()),
  removeFromGroups: z.array(z.string()),
});

export type UserWithGroupModifications = z.infer<
  typeof UserWithGroupModificationsSchema
>;

// UserWithGroupNames -----------------------------------------------

export const UserWithGroupNamesSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  groups: z.array(z.string()),
});

export type UserWithGroupNames = z.infer<typeof UserWithGroupNamesSchema>;
