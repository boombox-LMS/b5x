// TODO: Use Zod's recommendation for validating JSON data throughout
// TODO: Some of these feel internal to the data manager, move them there?

import { z } from "zod";

// TagType ----------------------------------------------------------

/**
 * Whether the tag's key can only be assigned once (mono),
 * or multiple times (multi).
 *
 * @example
 * A user tag with the `key` of user-group and a `value` of `data-scientists`
 * is likely a `multi` tag, since the user belongs to more than one group.
 *
 * @example
 * A user tag with the `key` of `topic-completion-count` and a `value` of `12`
 * is likely a `mono` tag, since it wouldn't make sense for there to be two
 * topic-completion counts for one user.
 */
export const TagTypeSchema = z.enum(["mono", "multi"]);

export type TagType = z.infer<typeof TagTypeSchema>;

// NewTag -----------------------------------------------------------

export const NewTagSchema = z
  .object({
    key: z.string(),
    value: z.any().optional(),
  })
  .strict();

/**
 * A new tag that is not yet associated with any users,
 * in database-insertable form.
 */
export type NewTag = z.infer<typeof NewTagSchema>;

// NewUserTagging --------------------------------------------------

export const NewUserTaggingSchema = NewTagSchema.extend({
  key: z.string(),
  value: z.any().optional(),
  userId: z.number(),
}).strict();

/**
 * The data required to associate a tag with a user.
 */
export type NewUserTagging = z.infer<typeof NewUserTaggingSchema>;

// NewTopicTagging --------------------------------------------------

export const NewTopicTaggingSchema = NewTagSchema.extend({
  topicId: z.number(),
}).strict();

/**
 * The data required to associate a tag with a topic.
 */
export type NewTopicTagging = z.infer<typeof NewTopicTaggingSchema>;

// NewTagging -------------------------------------------------------

export const NewTaggingSchema = z
  .object({
    taggableId: z.number(),
    taggableTableName: z.string(), // TODO: tighten
    tagId: z.number(),
    mode: TagTypeSchema,
  })
  .strict();

/**
 * A tagging in a database-insertable format.
 * The 'taggable' refers to the item being tagged -- a topic, user, etc.
 */
export type NewTagging = z.infer<typeof NewTaggingSchema>;

// NewMultiTagging --------------------------------------------------

export const NewMultiTaggingSchema = z
  .object({
    taggableId: z.number(),
    taggableTableName: z.string(),
    key: z.string(),
    value: z.any().optional(),
    mode: z.literal("multi").optional(),
  })
  .strict();

/**
 * A new tag that is in multi mode (see TagType).
 */
export type NewMultiTagging = z.infer<typeof NewMultiTaggingSchema>;

// SavedTag ---------------------------------------------------------

export const SavedTagSchema = NewTagSchema.extend({
  id: z.number(),
  value: z.any(),
  createdAt: z.date(),
  updatedAt: z.date(),
  mode: TagTypeSchema,
}).strict();

/**
 * A tag that has been directly retrieved from the database.
 */
export type SavedTag = z.infer<typeof SavedTagSchema>;

// TagWithTaggingId -------------------------------------------------

export const TagWithTaggingIdSchema = SavedTagSchema.extend({
  taggingId: z.number(), // TODO: Add null as a potential value here? That seems to be the case.
}).strict();

/**
 * A tag that also includes the id of an associated taggable.
 */
export type TagWithTaggingId = z.infer<typeof TagWithTaggingIdSchema>;
