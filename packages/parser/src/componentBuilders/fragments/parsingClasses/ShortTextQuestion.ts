import { FragmentViaBxmlTag } from "../abstractClasses/FragmentViaBxmlTag";
import { z } from "zod";
import { BxmlTagNodeSchema, BxmlTextNodeSchema } from "../../../types/bxmlNodes";
import { FragmentViaBxmlTagParams } from "../../../types/fragments";

// Markup -----------------------------------------------------------

export const exampleShortTextQuestionMarkup = `
<short-text-question>
What is the name of your hometown?
</short-text-question>
`;

// Types ------------------------------------------------------------

const ShortTextQuestionTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("short-text-question"),
    attribs: z
      .object({
        id: z.string().optional(),
        required: z.boolean().optional(),
      })
      .strict(),
    children: z.array(z.union([BxmlTagNodeSchema, BxmlTextNodeSchema])),
  })
  .strict();

type ShortTextQuestionTag = z.infer<typeof ShortTextQuestionTagSchema>;

// Class ------------------------------------------------------------

/**
 * A fragment that renders as a short text question,
 * providing a one-line text box beneath the content
 * provided by the author inside the `<short-text-question>` tag.
 */
export class ShortTextQuestion extends FragmentViaBxmlTag {
  bxmlNode: ShortTextQuestionTag;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    // TODO: Move this logic into the initial parsing for all attribs
    if (params.bxmlNode.attribs.required === "false") {
      params.bxmlNode.attribs.required = false;
    } else if (params.bxmlNode.attribs.required === "true") {
      params.bxmlNode.attribs.required = true;
    }
    this.bxmlNode = ShortTextQuestionTagSchema.parse(params.bxmlNode);
    this.convertToStatefulFragment({
      isRequired: this.bxmlNode.attribs.required || true,
    });
  }
}
