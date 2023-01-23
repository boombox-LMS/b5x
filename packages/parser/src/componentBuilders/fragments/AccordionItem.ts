import { FragmentViaBxmlTag } from "./FragmentViaBxmlTag";
import { z } from "zod";
import { FragmentViaBxmlTagParams } from "../../types/fragments";
import { BxmlTagNodeSchema, BxmlTextNodeSchema } from "../../types/bxmlNodes";

export const AccordionItemTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("accordion-item"),
    attribs: z.object({ title: z.string() }).strict(),
    children: z.array(z.union([BxmlTagNodeSchema, BxmlTextNodeSchema])),
  })
  .strict();

export type AccordionItemTag = z.infer<typeof AccordionItemTagSchema>;

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
