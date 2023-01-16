import { z } from "zod";
import { ConditionsListSchema } from "./condition";

// FragmentContentType ----------------------------------------------

export const FragmentContentTypeSchema = z.enum([
  "VisualList",
  "Diagram",
  "DocumentCompletionContent",
  "MermaidDiagram",
  "ShortTextQuestion",
  "LongTextQuestion",
  "SingleSelectQuestion",
  "MultiSelectQuestion",
  "Echo",
  "Rubric",
  "HtmlContent",
  "Troubleshooter",
  "UserReply",
  "SentimentCheck",
  "Slideshow",
  "Slide",
  "CodeBlock",
  "Checklist",
  "Step",
  "FiveStarRating",
  "Show",
  "MarkdownContent",
  "UnknownFragment",
  "Warning",
  "NpsQuestion",
  "Accordion",
  "AccordionItem",
  "Tab",
  "Tabs",
  "Badge",
]);

export type FragmentContentType = z.infer<typeof FragmentContentTypeSchema>;

// RawFragment ------------------------------------------------------

export const RawFragmentSchema = z
  .object({
    uri: z.string(),
    documentUri: z.string(),
    isRequired: z.boolean(),
    dependencyUris: z.array(z.string()),
    displayConditions: ConditionsListSchema,
    contentType: z.string(), // TODO: Define as enum
    contents: z.string().nullable(),
    data: z.any(),
    isStateful: z.boolean(),
    digest: z.string(),
    childUris: z.array(z.string()),
  })
  .strict();

/**
 * A newly built fragment that has not yet been stored or retrieved.
 */
export type RawFragment = z.infer<typeof RawFragmentSchema>;

// SavedFragment ----------------------------------------------------

export const SavedFragmentSchema = RawFragmentSchema.extend({
  fragmentExcerptId: z.number(),
  fragmentRefUri: z.string(),
}).strict();

/**
 * A fragment as it is stored in the database. This is an abstraction,
 * not a reflection of a literal table row.
 */
export type SavedFragment = z.infer<typeof SavedFragmentSchema>;

// DraftPublicFragment ----------------------------------------------

export const DraftPublicFragmentSchema = SavedFragmentSchema.pick({
  data: true,
  uri: true,
  documentUri: true,
  isRequired: true,
  dependencyUris: true,
  displayConditions: true,
  contentType: true,
  contents: true,
  isStateful: true,
  childUris: true,
}).strict();

/**
 * A PublicFragment that is still being prepared.
 */
export type DraftPublicFragment = z.infer<typeof DraftPublicFragmentSchema>;

// PublicFragment ---------------------------------------------------

/**
 * A fragment that includes its full child fragments, not just references
 * to the child fragments. This is useful in recursive rendering.
 */
export interface PublicFragment extends Omit<DraftPublicFragment, "childUris"> {
  children: PublicFragment[];
}

export const PublicFragmentSchema: z.ZodType<PublicFragment> = z.lazy(() =>
  DraftPublicFragmentSchema.omit({ childUris: true }).extend({
    children: z.array(PublicFragmentSchema),
  })
);
