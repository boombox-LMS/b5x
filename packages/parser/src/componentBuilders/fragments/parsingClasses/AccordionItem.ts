import { FragmentViaBxmlTag } from "../abstractClasses/FragmentViaBxmlTag";
import { z } from "zod";
import { FragmentViaBxmlTagParams } from "../../../types/fragments";
import {
  BxmlTagNodeSchema,
  BxmlTextNodeSchema,
} from "../../../types/bxmlNodes";
import { RawFragmentSchema } from "@b5x/types";

/**
 * The accordion item is created in the parsing of the accordion tag,
 * and is not invoked directly in markup, so it does not have its own
 * example markup.
 */

export const AccordionItemTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("accordion-item"),
    attribs: z.object({ title: z.string() }).strict(),
    children: z.array(z.union([BxmlTagNodeSchema, BxmlTextNodeSchema])),
  })
  .strict();

export type AccordionItemTag = z.infer<typeof AccordionItemTagSchema>;

export const AccordionItemApiDataSchema = RawFragmentSchema.extend({
  contentType: z.literal("AccordionItem"),
  contents: z.literal(""),
  isRequired: z.literal(false),
  isStateful: z.literal(false),
  childUris: z.array(z.string()).min(1),
  data: z.object({ title: z.string() }).strict(),
}).strict();

/**
 * A fragment that renders as a collapsible accordion item.
 */
export class AccordionItem extends FragmentViaBxmlTag {
  bxmlNode: AccordionItemTag;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = AccordionItemTagSchema.parse(params.bxmlNode);
    this.data = { title: this.bxmlNode.attribs.title };
  }
}

export const manifest = {
  contentType: "AccordionItem",
  tagName: "accordion-item",
  exampleMarkupStrings: [],
  parsingClass: AccordionItem,
  tagSchema: AccordionItemTagSchema,
  apiDataSchema: AccordionItemApiDataSchema,
};
