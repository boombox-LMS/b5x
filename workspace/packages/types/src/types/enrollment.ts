import { z } from "zod";
import { DocumentStatusSchema } from "./document";

// SavedEnrollment --------------------------------------------------

export const SavedEnrollmentSchema = z
  .object({
    id: z.number(),
    userId: z.number(),
    topicUri: z.string(),
    currentDocumentUri: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .strict();

/**
 * The enrollment as it is stored in the database.
 * An enrollment represents a user's relationship with a topic.
 */
export type SavedEnrollment = z.infer<typeof SavedEnrollmentSchema>;

// PublicEnrollment -------------------------------------------------

export const PublicEnrollmentSchema = SavedEnrollmentSchema.omit({
  createdAt: true,
  updatedAt: true,
})
  .extend({
    topicIsCompleted: z.boolean(),
    documentStatus: z.record(DocumentStatusSchema),
    progressPercentage: z.number().nullable(),
  })
  .strict();

/**
 * An enrollment with some extra information added,
 * such as the user's progress percentage,
 * and which documents are currently visible to the user.
 */
export type PublicEnrollment = z.infer<typeof PublicEnrollmentSchema>;
