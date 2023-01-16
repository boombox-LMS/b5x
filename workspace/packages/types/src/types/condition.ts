import { z } from "zod";

// ConditionConjunction ---------------------------------------------

export const ConditionConjunctionSchema = z
  .object({
    type: z.literal("conjunction"),
    data: z.enum(["and", "or"]),
  })
  .strict();

/**
 * The objects that chain multiple conditions into a series.
 */
export type ConditionConjunction = z.infer<typeof ConditionConjunctionSchema>;

// ConditionOperator ------------------------------------------------

export const ConditionOperatorSchema = z.enum([
  "is",
  "is-not",
  "matches",
  "status-is",
  "selections-include",
  "selections-do-not-include",
]);

/**
 * The comparison operation to perform between the expected value
 * and the real value.
 *
 * @example
 * `is-not`
 */
export type ConditionOperator = z.infer<typeof ConditionOperatorSchema>;

// UriConditionData -------------------------------------------------

export const UriConditionDataSchema = z
  .object({
    uri: z.string(),
    targetValue: z.string(),
    operator: ConditionOperatorSchema,
  })
  .strict();

/**
 * The data attribute of a UriCondition.
 */
export type UriConditionData = z.infer<typeof UriConditionDataSchema>;

// AliasConditionData -----------------------------------------------

export const AliasConditionDataSchema = z
  .object({
    alias: z.string(),
    targetValue: z.string(),
    operator: ConditionOperatorSchema,
  })
  .strict();

/**
 * The data attribute of an AliasCondition.
 */
export type AliasConditionData = z.infer<typeof AliasConditionDataSchema>;

// Condition --------------------------------------------------------

export const ConditionSchema = z
  .object({
    type: z.literal("condition"),
    data: UriConditionDataSchema,
  })
  .strict();

/**
 * A finalized condition.
 */
export type Condition = z.infer<typeof ConditionSchema>;

// DraftCondition ---------------------------------------------------

export const DraftConditionSchema = z
  .object({
    type: z.literal("condition"),
    data: z.union([AliasConditionDataSchema, UriConditionDataSchema]),
  })
  .strict();

/**
 * A condition that is still being processed during a topic build.
 *
 * @example
 * A draft condition might refer to a fragment value by its temporary
 * author-provided alias instead of its permanent URI.
 */
export type DraftCondition = z.infer<typeof DraftConditionSchema>;

// DraftConditionArrayItem ------------------------------------------

// Fragment references can be a mix of aliases and uris
// while the content tree is still resolving ...
export type DraftConditionsArrayItem =
  | DraftCondition
  | ConditionConjunction
  | DraftConditionsArrayItem[];

export const DraftConditionsArrayItemSchema: z.ZodType<DraftConditionsArrayItem> =
  z.lazy(() =>
    z.union([
      DraftConditionSchema,
      ConditionConjunctionSchema,
      z.array(DraftConditionsArrayItemSchema),
    ])
  );

// DraftConditionsList ----------------------------------------------

export const DraftConditionsListSchema = z.array(
  DraftConditionsArrayItemSchema
);
export type DraftConditionsList = z.infer<typeof DraftConditionsListSchema>;

// ConditionsArrayItem ----------------------------------------------

// ... but the final "official" conditions should
// only use fragment URIs as references

/**
 * A valid member of a ConditionsList.
 */
export type ConditionsArrayItem =
  | Condition
  | ConditionConjunction
  | ConditionsArrayItem[];
export const ConditionsArrayItemSchema: z.ZodType<ConditionsArrayItem> = z.lazy(
  () =>
    z.union([
      ConditionSchema,
      ConditionConjunctionSchema,
      z.array(ConditionsArrayItemSchema),
    ])
);

// ConditionsList ---------------------------------------------------
export const ConditionsListSchema = z.array(ConditionsArrayItemSchema);

/**
 * A collection of at least one condition, but it can also contain
 * conjunctions that join two or more conditions, and sublists of conditions/conjunctions.
 */
export type ConditionsList = z.infer<typeof ConditionsListSchema>;
