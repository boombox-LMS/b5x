import { FragmentViaBxmlTag } from "./FragmentViaBxmlTag";
import { ConditionsHelper } from "@b5x/conditions-manager";
import { z } from "zod";
import {
  BxmlTagNodeSchema,
  BxmlTextNodeSchema,
} from "../../../types/bxmlNodes";
import { FragmentViaBxmlTagParams } from "../../../types/fragments";

// TODO: The resulting fragments from Slide and Show are functionally similar.
// Have them become Container fragments so they can all be rendered with the same React component?

// Markup -----------------------------------------------------------

export const exampleShowMarkup = `
<show if='favorite-color is hot-pink'>
I like hot pink, too!
</show>
`;

// Types ------------------------------------------------------------

const ShowTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("show"),
    attribs: z
      .object({
        if: z.string(), // TODO: Refine with a ConditionsHelper function that verifies a valid condition
      })
      .strict(),
    children: z.array(z.union([BxmlTagNodeSchema, BxmlTextNodeSchema])).min(1),
  })
  .strict();

type ShowTag = z.infer<typeof ShowTagSchema>;

// Class ------------------------------------------------------------

/**
 * The fragment class responsible for parsing `<show>` tags,
 * which are used to conditionally render content.
 */
export class Show extends FragmentViaBxmlTag {
  bxmlNode: ShowTag;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = ShowTagSchema.parse(params.bxmlNode);
    // @ts-ignore TODO: Iron out the "draft conditions vs conditions" issue in RawFragments -- do we need a DraftRawFragment?
    this.displayConditions = ConditionsHelper.buildConditions(
      this.bxmlNode.attribs.if
    );
    this.childBxmlNodes = this.bxmlNode.children;
  }
}
