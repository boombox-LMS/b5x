import { ActivityMapSchema } from "./user";
import { z } from "zod";

// UserWithStats ----------------------------------------------------

export const UserWithStatsSchema = z
  .object({
    id: z.number(),
    email: z.string().email(),
    createdAt: z.date(),
    lastSeen: z.date(),
    responseRetryPercentage: z.number(),
    averageResponseLength: z.number(),
    activityMap: ActivityMapSchema,
    responseCount: z.number(),
    completedDocumentUris: z.array(z.string()),
    completedTopicUris: z.array(z.string()),
  })
  .strict();

/**
 * A user with data on recent activity, topic completions, etc.
 */
export type UserWithStats = z.infer<typeof UserWithStatsSchema>;

// PublicUserWithStats ----------------------------------------------

export const PublicUserWithStatsSchema = UserWithStatsSchema.omit({
  createdAt: true,
  lastSeen: true,
})
  .extend({
    createdAt: z.string(), // TODO: Update to string().datetime() when that launches shortly
    lastSeen: z.string(), // TODO: Update with string().datetime() when that launches shortly
  })
  .strict();

/**
 * A UserWithStats with JSONified date information.
 */
export type PublicUserWithStats = z.infer<typeof PublicUserWithStatsSchema>;

// TopicWithStats ---------------------------------------------------

export const TopicWithStatsSchema = z
  .object({
    uri: z.string(),
    title: z.string(),
    slug: z.string(),
    createdAt: z.date(),
    version: z.string(),
    enrollmentCount: z.number(),
    funnel: z.array(
      z.object({
        documentUri: z.string(),
        completionCount: z.number(),
      })
    ),
    completionCount: z.number(),
    completionRate: z.number(),
    npsData: z
      .object({
        calculatedNps: z.union([z.number(), z.literal("N/A")]),
        scores: z.array(z.number()),
      })
      .strict(),
  })
  .strict();

/**
 * A topic with stats on the number of enrollees,
 * number of completions, etc.
 */
export type TopicWithStats = z.infer<typeof TopicWithStatsSchema>;

// PublicTopicWithStats ---------------------------------------------

export const PublicTopicWithStatsSchema = TopicWithStatsSchema.omit({
  createdAt: true,
})
  .extend({
    createdAt: z.string(), // TODO: convert to z.string().datetime() when that's available shortly
  })
  .strict();

/**
 * A TopicWithStats with stringified dates.
 */
export type PublicTopicWithStats = z.infer<typeof PublicTopicWithStatsSchema>;
