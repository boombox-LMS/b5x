import { FragmentViaBxmlTagParams } from "../../../types/fragments";
import { FragmentViaBxmlTag } from "./FragmentViaBxmlTag";
import { z } from "zod";
import {
  BxmlTagNodeSchema,
  BxmlTextNodeSchema,
} from "../../../types/bxmlNodes";

// Markup -----------------------------------------------------------

export const exampleBreakoutMarkupOne = `
<breakout title=Tip>
A helpful tip would go here. Yay for breakouts!
</breakout>
`;

export const exampleBreakoutMarkupTwo = `
<breakout icon=mdi:lightbulb-on-10 title=Tip>
A helpful tip would go here. Yay for breakouts!
</breakout>
`;

export const exampleBreakoutMarkupThree = `
<breakout icon=noto-v1:cat title='Advice from a cat' color=#f7932a>
Always keep my food bowl filled to the brim. If you don't, I will become dangerously malnourished.
</breakout>
`;

// Types ------------------------------------------------------------

export const BreakoutTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("breakout"),
    attribs: z
      .object({
        title: z.string(),
        icon: z.string().optional(),
        color: z.string().optional(),
      })
      .strict(),
    children: z.array(z.union([BxmlTagNodeSchema, BxmlTextNodeSchema])).min(1),
  })
  .strict();

type BreakoutTag = z.infer<typeof BreakoutTagSchema>;

// Class ------------------------------------------------------------

/**
 * A fragment that renders a highlighted snippet of content that could be
 * used to display a tip, best practice, or other aside.
 */
export class Breakout extends FragmentViaBxmlTag {
  bxmlNode: BreakoutTag;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = BreakoutTagSchema.parse(params.bxmlNode);
    this.childBxmlNodes = this.bxmlNode.children;
    this.data = {
      title: this.bxmlNode.attribs.title,
      icon: this.bxmlNode.attribs.icon,
      color: this.bxmlNode.attribs.color,
    };
  }
}
