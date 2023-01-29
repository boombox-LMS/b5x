import { FragmentViaBxmlTagParams } from "../../../types/fragments";
import { FragmentViaBxmlTag } from "../abstractClasses/FragmentViaBxmlTag";
import { z } from "zod";
import {
  BxmlTagNodeSchema,
  BxmlTextNodeSchema,
} from "../../../types/bxmlNodes";
import { RawFragmentSchema } from "@b5x/types";

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

const WarningApiDataSchema = RawFragmentSchema.extend({
  contentType: z.literal("Warning"),
  data: z.object({}).strict(),
  childUris: z.array(z.string()).min(1),
  isStateful: z.literal(true),
  contents: z.literal(""),
}).strict();

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

export const manifest = {
  contentType: "Warning",
  tagName: "warning",
  exampleMarkupStrings: [exampleWarningMarkup],
  apiDataSchema: WarningApiDataSchema,
  parsingClass: Warning,
  tagSchema: WarningTagSchema,
};
