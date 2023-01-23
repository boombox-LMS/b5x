// TODO: Change hasState to hasValue, and StatefulFragment to FragmentWithValue
import { FragmentViaBxmlTag } from "./FragmentViaBxmlTag";
import { z } from "zod";
import { BxmlTagNodeSchema, BxmlTextNodeSchema } from "../../types/bxmlNodes";
import { FragmentViaBxmlTagParams } from "../../types/fragments";

// Markup -----------------------------------------------------------

export const exampleSlideMarkup = `
<slide>
![caterpillar](caterpillar.svg)

Every butterfly begins as a caterpillar (all of whom are notorious for eating a whole lot).
</slide>
`;

// Types ------------------------------------------------------------

export const SlideTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("slide"),
    attribs: z.object({}).strict(),
    children: z.array(z.union([BxmlTagNodeSchema, BxmlTextNodeSchema])),
  })
  .strict();

export type SlideTag = z.infer<typeof SlideTagSchema>;

// Class ------------------------------------------------------------

/**
 *  A slide is essentially a passive container
 *  for a list of child fragments. Slides only exist as the child
 *  fragments of slideshows, and are only rendered in that context.
 */
export class Slide extends FragmentViaBxmlTag {
  bxmlNode: SlideTag;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = SlideTagSchema.parse(params.bxmlNode);
    this.childBxmlNodes = this.bxmlNode.children;
  }
}
