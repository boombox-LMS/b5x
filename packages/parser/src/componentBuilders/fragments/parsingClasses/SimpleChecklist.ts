import { FragmentViaBxmlTag } from "../abstractClasses/FragmentViaBxmlTag";
import { z } from "zod";
import { FragmentViaBxmlTagParams } from "../../../types/fragments";
import { RawFragmentSchema } from "@b5x/types";
import { BxmlTextNodeSchema } from "../../../types/bxmlNodes";
import md5 from "md5";

// Markup -------------------------------------------

/**
 * Example markup for the `simple-checklist` tag.
 */
export const exampleSimpleChecklistMarkup = `
<simple-checklist>
<step>Pack your bag (see [packing list](https://www.smartertravel.com/the-ultimate-packing-list/))</step>
<step>Check in for your flight</step>
<step>**Go to Hawaii!**</step>
</simple-checklist>
`;

// Types ------------------------------------------------------------

// TODO: To improve the markup, consider just using Markdown uls instead,
// and then using the Markdown parser to convert them to steps.
// This will avoid confusion with the more complex step tag
// that has a title attribute.
const StepTagSchema = z.object({
  type: z.literal("tag"),
  name: z.literal("step"),
  attribs: z.object({}).strict(),
  children: z.array(BxmlTextNodeSchema).length(1),
});

const SimpleChecklistTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("simple-checklist"),
    attribs: z.object({}).strict(),
    children: z.array(StepTagSchema).min(1),
  })
  .strict();

type SimpleChecklistTag = z.infer<typeof SimpleChecklistTagSchema>;

export const SimpleChecklistDataSchema = z
  .object({
    steps: z.array(
      z.object({
        label: z.string(),
        id: z.string(),
      })
    ),
  })
  .strict();

export type SimpleChecklistData = z.infer<typeof SimpleChecklistDataSchema>;

export const SimpleChecklistApiDataSchema = RawFragmentSchema.extend({
  contentType: z.literal("SimpleChecklist"),
  contents: z.literal(""),
  isStateful: z.literal(true),
  childUris: z.array(z.string()).length(0),
  data: SimpleChecklistDataSchema,
}).strict();

// Class ------------------------------------------------------------

/**
 * A fragment that renders as a simple checklist. The user can mark each step as complete.
 */
export class SimpleChecklist extends FragmentViaBxmlTag {
  bxmlNode: SimpleChecklistTag;
  data: SimpleChecklistData;
  childBxmlNodes: [];

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = SimpleChecklistTagSchema.parse(params.bxmlNode);
    this.data = this.buildData();
    this.convertToStatefulFragment();
    this.childBxmlNodes = [];
  }

  buildData(): SimpleChecklistData {
    return {
      steps: this.bxmlNode.children.map((stepTag) => {
        return {
          label: stepTag.children[0].data,
          id: md5(stepTag.children[0].data),
        };
      }),
    };
  }
}

export const manifest = {
  contentType: "SimpleChecklist",
  tagName: "simple-checklist",
  parsingClass: SimpleChecklist,
  exampleMarkupStrings: [exampleSimpleChecklistMarkup],
  apiDataSchema: SimpleChecklistApiDataSchema,
  tagSchema: SimpleChecklistTagSchema,
};
