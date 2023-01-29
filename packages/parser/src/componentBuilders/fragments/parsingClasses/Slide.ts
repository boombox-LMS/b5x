// TODO: Change hasState to hasValue, and StatefulFragment to FragmentWithValue
import { FragmentViaBxmlTag } from "../abstractClasses/FragmentViaBxmlTag";
import { z } from "zod";
import {
  BxmlTagNodeSchema,
  BxmlTextNodeSchema,
} from "../../../types/bxmlNodes";
import { FragmentViaBxmlTagParams } from "../../../types/fragments";
import { RawFragmentSchema } from "@b5x/types";

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

export const SlideTagApiDataSchema = RawFragmentSchema.extend({
  contentType: z.literal("Slide"),
  data: z.object({}).strict(),
  childUris: z.array(z.string()).min(1),
  isStateful: z.literal(false),
  contents: z.literal(""),
}).strict();

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

export const manifest = {
  contentType: "Slide",
  tagName: "slide",
  exampleMarkupStrings: [exampleSlideMarkup],
  parsingClass: Slide,
  apiDataSchema: SlideTagApiDataSchema,
  tagSchema: SlideTagSchema,
};
