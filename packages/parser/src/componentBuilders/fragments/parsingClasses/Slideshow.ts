import { FragmentViaBxmlTag } from "../abstractClasses/FragmentViaBxmlTag";
import { z } from "zod";
import { FragmentViaBxmlTagParams } from "../../../types/fragments";
import { SlideTagSchema, SlideTag } from "./Slide";

/**
 * Example markup for the `slideshow` tag.
 */
export const exampleSlideshowMarkup = `
<slideshow>

<slide>
![caterpillar](caterpillar.svg)

Every butterfly begins as a caterpillar (all of whom are notorious for eating a whole lot).
</slide>

<slide>
![chrysalis](chrysalis.svg)

After eating like it's Thanksgiving for many days in a row, the caterpillar forms a chrysalis. It won't be long now ...
</slide>

<slide>
![butterfly](butterfly.svg)

At long last, a brand-new butterfly enters the world!
</slide>

</slideshow>
`;

const SlideshowTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("slideshow"),
    attribs: z.object({}).strict(),
    children: z.array(SlideTagSchema),
  })
  .strict();

type SlideshowTag = z.infer<typeof SlideshowTagSchema>;

/**
 * A fragment that renders as a slideshow.
 * It's a stateful fragment because the user's place in the slideshow
 * is preserved.
 */
export class Slideshow extends FragmentViaBxmlTag {
  bxmlNode: SlideshowTag;
  childBxmlNodes: SlideTag[];

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = SlideshowTagSchema.parse(params.bxmlNode);
    this.childBxmlNodes = this.bxmlNode.children;
    this.convertToStatefulFragment();
  }
}
