import { z } from "zod";
import {
  ConditionsListSchema,
  ConditionsList,
  FragmentContentTypeSchema,
  FragmentContentType,
} from "@b5x/types";
import { BxmlTagNodeSchema, BxmlNodeSchema, BxmlNode } from "./bxmlNodes";

export interface FragmentCombinationResult {
  uri: string;
  data: any;
  displayConditions: ConditionsList;
  contentType: FragmentContentType;
  bxmlNode: BxmlNode;
}

export const FragmentParamsSchema = z.object({
  // required
  document: z.any(), // This is an instance of Document, but using the Document class here causes a circular import issue, since the Document class imports the Fragment class, which imports this schema
  uri: z.string(),
  // optional
  contentType: z.optional(FragmentContentTypeSchema),
  displayConditions: z.optional(ConditionsListSchema),
  contents: z.string().optional(),
  data: z.any().optional(),
  bxmlNode: z.optional(BxmlNodeSchema),
  alias: z.string().optional(), // TODO: Can this be omitted once uri assignment logic is moved fully into the Document?
});

export type FragmentParams = z.infer<typeof FragmentParamsSchema>;

export const FragmentViaArgsParamsSchema = FragmentParamsSchema.extend({
  contentType: FragmentContentTypeSchema,
  isRequired: z.boolean().optional(),
  isStateful: z.boolean().optional(),
});

export type FragmentViaArgsParams = z.infer<typeof FragmentViaArgsParamsSchema>;

export const FragmentViaBxmlTagParamsSchema = FragmentParamsSchema.omit({
  contentType: true,
}).extend({
  bxmlNode: BxmlTagNodeSchema,
});

/**
 * The parameters used to initialize a fragment that should be built
 * from a B-XML tag.
 */
export type FragmentViaBxmlTagParams = z.infer<
  typeof FragmentViaBxmlTagParamsSchema
>;
