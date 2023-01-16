import { z } from "zod";
import { ContentModeSchema } from "./contentMode";
import { PublicFragmentSchema } from "./fragment";
import { ConditionsListSchema } from "./condition";
import { RawFragmentSchema, SavedFragmentSchema } from "./fragment";

// RawDocument ------------------------------------------------------

export const RawDocumentSchema = z
  .object({
    uri: z.string(),
    topicUri: z.string(),
    slug: z.string(),
    title: z.string(),
    order: z.number(),
    completionConditions: ConditionsListSchema,
    config: z.any(), // TODO: Flesh out or omit?
    dependencyUris: z.array(z.string().min(1)),
    displayConditions: ConditionsListSchema,
    externalDependencyUris: z.array(z.string()),
    digest: z.string(),
    childUris: z.array(z.string()),
    contentMode: ContentModeSchema,
    fragmentsByUri: z.record(z.string(), RawFragmentSchema),
  })
  .strict();

/**
 * A newly built document which has not yet been stored or retrieved.
 */
export type RawDocument = z.infer<typeof RawDocumentSchema>;

// DocumentContents -------------------------------------------------

export const DocumentContentsSchema = z
  .object({
    uri: z.string(),
    topicUri: z.string(),
    contentMode: z.string(),
    fragments: z.array(PublicFragmentSchema),
  })
  .strict();

/**
 * A document's full content tree,
 * along with the document's basic identifying information.
 */
export type DocumentContents = z.infer<typeof DocumentContentsSchema>;

// ExpandedDocument -------------------------------------------------

export const ExpandedDocumentSchema = RawDocumentSchema.omit({
  fragmentsByUri: true,
})
  .extend({
    fragmentsByUri: z.record(z.string(), SavedFragmentSchema),
  })
  .strict();

/**
 * A complete document that includes its full content tree.
 */
export type ExpandedDocument = z.infer<typeof ExpandedDocumentSchema>;

// DocumentStatus ---------------------------------------------------

export const DocumentStatusSchema = z
  .object({
    isVisible: z.boolean(),
    isLocked: z.boolean(),
    isCompleted: z.boolean(),
    nextVisibleDocumentUri: z.string().nullable(),
  })
  .strict();

/**
 * The state of a document within a given user's view of a topic,
 * including information about whether it is visible.
 */
export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;
