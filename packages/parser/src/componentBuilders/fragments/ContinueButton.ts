import { FragmentViaBxmlTag } from "./FragmentViaBxmlTag";
import { z } from "zod";
import { BxmlTagNodeSchema, BxmlTextNodeSchema } from "../../types/bxmlNodes";
import { FragmentViaBxmlTagParams } from "../../types/fragments";

// Markup -----------------------------------------------------------

export const exampleContinueButtonMarkup = `
<continue-button>I'm ready. Launch the challenge!</continue-button>
`;

// Types ------------------------------------------------------------

const ContinueButtonTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("continue-button"),
    attribs: z.object({}).strict(),
    // TODO: Convert to just allowing plain Markdown? Leaving it for now so the snapshot tests stay useful during refactor.
    children: z.array(z.union([BxmlTagNodeSchema, BxmlTextNodeSchema])).min(1),
  })
  .strict();

type ContinueButtonTag = z.infer<typeof ContinueButtonTagSchema>;

// Class ------------------------------------------------------------

/**
 * A fragment that renders a button blocking subsequent content from loading until the user clicks it.
 */
export class ContinueButton extends FragmentViaBxmlTag {
  bxmlNode: ContinueButtonTag;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = ContinueButtonTagSchema.parse(params.bxmlNode);
    this.convertToStatefulFragment();
  }
}
