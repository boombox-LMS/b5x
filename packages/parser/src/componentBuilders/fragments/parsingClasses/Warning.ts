import { FragmentViaBxmlTagParams } from "../../../types/fragments";
import { FragmentViaBxmlTag } from "../abstractClasses/FragmentViaBxmlTag";
import { z } from "zod";
import {
  BxmlTagNodeSchema,
  BxmlTextNodeSchema,
} from "../../../types/bxmlNodes";

// Markup -----------------------------------------------------------

export const exampleWarningMarkup = `
<warning>
This is a warning.
</warning>
`;

// Types ------------------------------------------------------------

export const WarningTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("warning"),
    attribs: z.object({}).strict(),
    children: z.array(z.union([BxmlTagNodeSchema, BxmlTextNodeSchema])).min(1),
  })
  .strict();

type WarningTag = z.infer<typeof WarningTagSchema>;

// Class ------------------------------------------------------------

/**
 * A fragment that renders a warning that must be acknowledged by the user
 * before subsequent content can be rendered.
 */
export class Warning extends FragmentViaBxmlTag {
  bxmlNode: WarningTag;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = WarningTagSchema.parse(params.bxmlNode);
    this.childBxmlNodes = this.bxmlNode.children;
    this.convertToStatefulFragment();
  }
}
