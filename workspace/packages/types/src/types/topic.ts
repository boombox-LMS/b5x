import { z } from "zod";
import { RawDocumentSchema, ExpandedDocumentSchema } from "./document";
import { ContentModeSchema } from "./contentMode";

// TopicAccessLevel -------------------------------------------------

export const TopicAccessLevelSchema = z.enum([
  "blocked",
  "available",
  "recommended",
  "assigned",
  "reviewable",
  "facilitated",
  "owned",
]);

/**
 * A string representation of the user's access to the topic.
 * Currently the same as TopicPriorityLevel, but these will diverge
 * with refactoring.
 */
export type TopicAccessLevel = z.infer<typeof TopicAccessLevelSchema>;

// TopicPriorityLevel -----------------------------------------------

export const TopicPriorityLevelSchema = z.enum([
  "blocked",
  "available",
  "recommended",
  "assigned",
  "reviewable",
  "facilitated",
  "owned",
]);

/**
 * A string representation of the user's expected urgency around a topic.
 * Currently the same as TopicAccessLevel, but these will diverge
 * with refactoring.
 */
export type TopicPriorityLevel = z.infer<typeof TopicPriorityLevelSchema>;

// TopicCompletionStatus --------------------------------------------

export const TopicCompletionStatusSchema = z.enum([
  "completed",
  "in progress",
  "not started",
]);

/**
 * A string representation of the user's completion status for a topic.
 *
 * @example
 * 'in progress'
 */
export type TopicCompletionStatus = z.infer<typeof TopicCompletionStatusSchema>;

// TopicPrerequisite ------------------------------------------------

export const TopicPrerequisiteSchema = z
  .object({
    title: z.string(),
    slug: z.string(),
  })
  .strict();

/**
 * Enough information about a topic prerequisite to allow a display link
 * or other reference to the prerequisite to be created if desired.
 */
export type TopicPrerequisite = z.infer<typeof TopicPrerequisiteSchema>;

// UnmetTopicPrerequisite -------------------------------------------

export const UnmetTopicPrerequisiteSchema = z
  .object({
    title: z.string(),
    uri: z.string(),
  })
  .strict();

/**
 * Enough information about a topic prerequisite to allow a display link
 * or other reference to the prerequisite to be created if desired.
 */
export type UnmetTopicPrerequisite = z.infer<
  typeof UnmetTopicPrerequisiteSchema
>;

// TopicConfig ------------------------------------------------------

// TODO: Kill the topic config entirely
export const TopicConfigSchema = z
  .object({
    slug: z.string(),
    contentMode: ContentModeSchema,
    groupAccessLevels: z.record(TopicAccessLevelSchema, z.array(z.string())),
    prerequisites: z.array(z.string()),
  })
  .strict();

/**
 * Slated for deprecation, as an attribute's location in the config
 * versus in the top level of the topic is arbitrary.
 */
export type TopicConfig = z.infer<typeof TopicConfigSchema>;

// RawTopic ---------------------------------------------------------

export const RawTopicSchema = z
  .object({
    uri: z.string(),
    version: z.string(),
    config: TopicConfigSchema,
    slug: z.string(),
    title: z.string(),
    subtitle: z.string(),
    coverImageUrl: z.string(),
    documents: z.array(RawDocumentSchema),
  })
  .strict();

/**
 * A newly built topic that has not yet been stored or retrieved.
 */
export type RawTopic = z.infer<typeof RawTopicSchema>;

// SavedTopic -------------------------------------------------------

export const SavedTopicSchema = RawTopicSchema.omit({
  documents: true,
}).strict();

/**
 * A topic that has been loaded directly from the database.
 */
export type SavedTopic = z.infer<typeof SavedTopicSchema>;

// TopicInfo --------------------------------------------------------

export const TopicInfoSchema = SavedTopicSchema.extend({
  firstDocumentUri: z.string(),
  prerequisites: z.array(TopicPrerequisiteSchema),
}).strict();

/**
 * A saved topic with prerequisites and firstDocumentUri added.
 * A lingering type from the migration to TypeScript,
 * can probably be deprecated in favor of fewer topic types.
 */
export type TopicInfo = z.infer<typeof TopicInfoSchema>;

// TopicWithEnrollmentInfo ------------------------------------------

export const TopicWithEnrollmentInfoSchema = SavedTopicSchema.extend({
  firstDocumentUri: z.string(),
  prerequisites: z.array(TopicPrerequisiteSchema),
  unmetPrerequisites: z.array(UnmetTopicPrerequisiteSchema),
  enrollmentData: z.object({
    currentDocumentUri: z.string(),
    topicVersion: z.string(),
  }),
});

/**
 * A topic that includes some high-level enrollment information,
 * such as the URI of the user's current document.
 */
export type TopicWithEnrollmentInfo = z.infer<
  typeof TopicWithEnrollmentInfoSchema
>;

// ExpandedTopic ----------------------------------------------------

export const ExpandedTopicSchema = SavedTopicSchema.extend({
  documents: z.array(ExpandedDocumentSchema),
}).strict();

/**
 * A topic that includes a full copy of all of its associated data,
 * such as documents and fragments.
 */
export type ExpandedTopic = z.infer<typeof ExpandedTopicSchema>;

// TopicAccessRule --------------------------------------------------

export const TopicAccessRuleSchema = z
  .object({
    accessLevel: TopicAccessLevelSchema,
    groupName: z.string(),
    topicSlug: z.string(),
  })
  .strict();

/**
 * An access-control rule.
 *
 * @example
 * ```
 * {accessLevel: 'assigned', groupName: 'data-scientists', topicSlug: 'data-at-cloudco'}
 * ```
 */
export type TopicAccessRule = z.infer<typeof TopicAccessRuleSchema>;

// SavedAccessRule --------------------------------------------------

export const SavedAccessRuleSchema = TopicAccessRuleSchema.extend({
  id: z.number(),
}).strict();

/**
 * An access-control rule as it appears in the database table.
 */
export type SavedAccessRule = z.infer<typeof SavedAccessRuleSchema>;

// PublicTopic ------------------------------------------------------

// TODO: Verify that this is being used
// as the public topic. Why does catalog topic
// also exist? This does not seem to be returned by topics.info either.
export const PublicTopicSchema = z
  .object({
    uri: z.string(),
    subtitle: z.string(),
    title: z.string(),
    coverImageUrl: z.string(),
    slug: z.string(),
    config: TopicConfigSchema,
    prerequisites: z.array(TopicPrerequisiteSchema),
    documents: z.array(
      z.object({
        uri: z.string(),
        title: z.string(),
        topicUri: z.string(),
      })
    ),
  })
  .strict();

/**
 * A topic in a format that can be rendered for the user,
 * including its documents.
 */
export type PublicTopic = z.infer<typeof PublicTopicSchema>;

// TopicWithAccessInfo ----------------------------------------------

export const TopicWithAccessInfoSchema = SavedTopicSchema.extend({
  accessLevel: TopicAccessLevelSchema,
  unmetPrerequisites: z.array(UnmetTopicPrerequisiteSchema),
  priorityLevel: TopicPriorityLevelSchema,
}).strict();

/**
 * A topic that includes its associated access rules.
 */
export type TopicWithAccessInfo = z.infer<typeof TopicWithAccessInfoSchema>;

// RawCatalogTopic --------------------------------------------------

// TODO: I think this should be changed to DraftCatalogTopic
// to accurately reflect the naming conventions.
// Also, what's the difference between a saved topic and a raw catalog topic?

export const RawCatalogTopicSchema = z
  .object({
    uri: z.string(),
    version: z.string(),
    slug: z.string(),
    title: z.string(),
    subtitle: z.string(),
    coverImageUrl: z.string(),
    contentMode: ContentModeSchema,
    prerequisites: z.array(z.string()),
  })
  .strict();

/**
 * A PublicCatalogTopic that is still being processed.
 */
export type RawCatalogTopic = z.infer<typeof RawCatalogTopicSchema>;

// PublicCatalogTopic -----------------------------------------------

export const PublicCatalogTopicSchema = RawCatalogTopicSchema.extend({
  priorityLevel: TopicPriorityLevelSchema,
  firstDocumentUri: z.string(),
  completionStatus: z.string(),
  currentDocumentUri: z.string().nullable(),
  unmetPrerequisites: z.array(UnmetTopicPrerequisiteSchema),
}).strict();

/**
 * A topic designed to be displayed in the user's content catalog,
 * as it includes some information about the user's relationship with the topic
 * (such as whether the user has completed the topic).
 */
export type PublicCatalogTopic = z.infer<typeof PublicCatalogTopicSchema>;
