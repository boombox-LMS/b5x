import { z } from "zod";

// NewTicket --------------------------------------------------------

export const TicketPriorityLevelSchema = z.number().min(0).max(5);

export const NewTicketSchema = z
  .object({
    reporterId: z.number(),
    reporterUrl: z.string().url(),
    description: z.any(), // TODO: Use the correct type from the RTF editor here, if Zod can derive it
    title: z.string(),
    priorityLevel: TicketPriorityLevelSchema,
  })
  .strict();

/**
 * A ticket in database-insertable format. A ticket represents
 * user-reported issues or user-reported feedback.
 */
export type NewTicket = z.infer<typeof NewTicketSchema>;

// SavedTicket ------------------------------------------------------

export const SavedTicketSchema = NewTicketSchema.extend({
  id: z.number(),
  status: z.string(), // TODO: Make more specific
  assigneeId: z.number().nullable(),
}).strict();

/**
 * A ticket that has been retrieved directly from the database.
 */
export type SavedTicket = z.infer<typeof SavedTicketSchema>;

// PublicTicket -----------------------------------------------------

export const PublicTicketSchema = SavedTicketSchema.extend({
  createdAt: z.string(), // TODO: Add datetime when available
  updatedAt: z.string(), // TODO: Add datetime when available
  assigneeEmail: z.string().email().nullable(),
});

export type PublicTicket = z.infer<typeof PublicTicketSchema>;

// IssueTicket ------------------------------------------------------

export const IssueTicketSchema = PublicTicketSchema.extend({
  priorityLevel: z.number().min(0).max(2),
}).strict();

/**
 * A ticket that represents a bug.
 */
export type IssueTicket = z.infer<typeof IssueTicketSchema>;

// FeedbackTicket ---------------------------------------------------

export const FeedbackTicketSchema = PublicTicketSchema.extend({
  priorityLevel: z.number().min(3).max(5),
}).strict();

/**
 * A ticket that represents an idea, opinion, or request.
 */
export type FeedbackTicket = z.infer<typeof FeedbackTicketSchema>;
