import { FragmentViaBxmlTag } from "./FragmentViaBxmlTag";
import { z } from "zod";
import { FragmentViaBxmlTagParams } from "../../types/fragments";

// Markup -----------------------------------------------------------

export const exampleBadgeMarkup = `
<badge
  title='Example badge'
  description='Viewed the example badge in the component catalog.'
  icon=mdi:badge-outline
/>
`;

// Types ------------------------------------------------------------

const BadgeTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("badge"),
    attribs: z
      .object({
        title: z.string(),
        description: z.string(),
        icon: z.string(),
      })
      .strict(),
    children: z.array(z.any()).length(0),
  })
  .strict();

type BadgeTag = z.infer<typeof BadgeTagSchema>;

// Class ------------------------------------------------------------

/**
 * A fragment that awards a badge when rendered.
 */
export class Badge extends FragmentViaBxmlTag {
  bxmlNode: BadgeTag;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = BadgeTagSchema.parse(params.bxmlNode);
    this.data = {
      ...this.bxmlNode.attribs,
      icon: this.getImageUrlFromAssetName(this.bxmlNode.attribs.icon),
    };
    this.convertToStatefulFragment();
  }
}
