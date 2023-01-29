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

export const exampleStepMarkup = `
<step title='Initialize your topic'>
Create a new topic with the following command:

<code-block>
b5x init
</code-block>

If you need more help, just [Google it](https://www.google.com).
</step>
`;

// Types ------------------------------------------------------------

export const StepTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("step"),
    attribs: z.object({ title: z.string() }).strict(),
    children: z.array(z.union([BxmlTagNodeSchema, BxmlTextNodeSchema])).min(1),
  })
  .strict();

export type StepTag = z.infer<typeof StepTagSchema>;

const StepTagDataSchema = z.object({ title: z.string() }).strict();

type StepTagData = z.infer<typeof StepTagDataSchema>;

export const StepTagApiDataSchema = RawFragmentSchema.extend({
  contentType: z.literal("Step"),
  data: StepTagDataSchema,
  childUris: z.array(z.string()).min(1),
  isStateful: z.literal(false),
  contents: z.literal(""),
}).strict();

// Class ------------------------------------------------------------

/**
 *  A step is essentially a passive container
 *  for a list of child fragments. Steps only exist as the child
 *  fragments of checklists, and are only rendered in that context.
 */
export class Step extends FragmentViaBxmlTag {
  bxmlNode: StepTag;
  data: StepTagData;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = StepTagSchema.parse(params.bxmlNode);
    this.data = { title: this.bxmlNode.attribs.title };
    this.childBxmlNodes = this.bxmlNode.children;
  }
}

export const manifest = {
  contentType: "Step",
  tagName: "step",
  exampleMarkupStrings: [exampleStepMarkup],
  tagSchema: StepTagSchema,
  apiDataSchema: StepTagApiDataSchema,
  parsingClass: Step,
};
