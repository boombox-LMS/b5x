import { z } from "zod";

// NewEvent ---------------------------------------------------------

export const NewEventSchema = z
  .object({
    name: z.string(),
    data: z.any(),
  })
  .strict();

/**
 * An analytics event as it is inserted into the database.
 */
export type NewEvent = z.infer<typeof NewEventSchema>;

// SavedEvent -------------------------------------------------------

export const SavedEventSchema = NewEventSchema.extend({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
}).strict();

/**
 * An analytics event as it is retrieved directly from the database.
 */
export type SavedEvent = z.infer<typeof SavedEventSchema>;
