import { FragmentViaBxmlTag } from "../abstractClasses/FragmentViaBxmlTag";
import { BxmlTextNodeSchema } from "../../../types/bxmlNodes";
import { z } from "zod";
import { FragmentViaBxmlTagParams } from "../../../types/fragments";
import { marked } from "marked";

// Markup -----------------------------------------------------------

export const exampleVerticalVisualListMarkup = `
<visual-list vertical>

<item image='leadership.svg'>
# The Leader

- Identifies and prioritizes knowledge gaps
- Assesses and recognizes content health at the org level
</item>

<item image='developer.svg'>
# The Subject-Matter Expert

- Contributes information
- Maintains technical accuracy of information
</item>

<item image='apple.svg'>
# The Learning Team Member

- Enhances/repackages high-priority content
- Assigns or recommends content
- Supports learners, especially new hires
- Analyzes metrics and feedback
</item>

<item image='creative-idea.svg'>
# The Learner

- Consumes technical information
- Demonstrates skills by completing challenges
- Provides feedback on content
- Requests new content
</item>

<item image='organization-chart.svg'>
# The Manager

- Assigns or recommends content to team
- Assesses and recognizes participation in knowledge-sharing
</item>

</visual-list>
`;

// Types ------------------------------------------------------------

const ItemTagSchema = z.object({
  type: z.literal("tag"),
  name: z.literal("item"),
  attribs: z.object({ image: z.string() }).strict(),
  children: z.array(BxmlTextNodeSchema).length(1), // Eventually the VisualListItem could become its own container fragment and support more tag types, but for v1 it's plain Markdown only
});

type ItemTag = z.infer<typeof ItemTagSchema>;

const VisualListTagSchema = z.object({
  type: z.literal("tag"),
  name: z.literal("visual-list"),
  attribs: z
    .object({
      vertical: z.literal("").optional(),
      horizontal: z.literal("").optional(),
    })
    .strict(),
  children: z.array(ItemTagSchema),
});

type VisualListTag = z.infer<typeof VisualListTagSchema>;

const ItemDataSchema = z
  .object({
    imageUrl: z.string().url(),
    contents: z.string().min(1),
  })
  .strict();

type ItemData = z.infer<typeof ItemDataSchema>;

export const VisualListDataSchema = z.object({
  orientation: z.union([z.literal("horizontal"), z.literal("vertical")]),
  items: z.array(ItemDataSchema).min(1),
});

type VisualListData = z.infer<typeof VisualListDataSchema>;

// Class ------------------------------------------------------------

/**
 * A fragment that renders an illustrated list of items,
 * with each item containing an image and some text.
 */
export class VisualList extends FragmentViaBxmlTag {
  bxmlNode: VisualListTag;
  data: VisualListData;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    // validate the BxmlNode against the expected markup pattern
    this.bxmlNode = VisualListTagSchema.passthrough().parse(params.bxmlNode);
    this.data = this.#buildData();
    this.childBxmlNodes = [];
  }

  #buildData(): VisualListData {
    const result = {
      orientation: "vertical",
      items: this.bxmlNode.children.map((itemTag) => {
        return this.#buildItem(itemTag);
      }),
    };
    return VisualListDataSchema.parse(result);
  }

  #buildItem(itemTag: ItemTag): ItemData {
    return {
      imageUrl: this.getImageUrlFromAssetName(itemTag.attribs.image),
      contents: marked.parse(itemTag.children[0].data),
    };
  }
}
