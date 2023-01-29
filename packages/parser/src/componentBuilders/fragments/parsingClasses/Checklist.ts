import { FragmentViaBxmlTag } from "../abstractClasses/FragmentViaBxmlTag";
import { z } from "zod";
import { FragmentViaBxmlTagParams } from "../../../types/fragments";
import { StepTagSchema, StepTag } from "./Step";
import { RawFragmentSchema } from "@b5x/types";

// Markup -------------------------------------------

/**
 * Example markup for the `checklist` tag.
 *
 * TODOs for human readability:
 * - Move the title into a step tag attribute.
 * - Kill the description tag.
 */
export const exampleChecklistMarkup = `
<checklist>

<step title='Verify your PagerDuty access'>
Try logging in at [pagerduty.com](https://www.pagerduty.com). If that works, you're done with this step.
</step>

<step title='Configure PagerDuty'>
Navigate to the [PagerDuty settings page](https://www.pagerduty.com/settings), and verify all of the below:
- You can see your next oncall rotation.
- Your phone number is correct.
- Your email address is correct.
</step>

<step title='Trigger a test incident'>
Use the [Pagerduty guide for triggering a test incident](https://support.pagerduty.com/docs/incidents#section-triggering-an-incident-with-web-ui-email-or-api) to test your settings.
</step>

</checklist>
`;

// Types ------------------------------------------------------------

const ChecklistTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("checklist"),
    attribs: z
      .object({
        id: z.string().optional(),
      })
      .strict(),
    children: z.array(StepTagSchema),
  })
  .strict();

type ChecklistTag = z.infer<typeof ChecklistTagSchema>;

export const ChecklistDataSchema = z
  .object({
    completionContent: z.string(),
  })
  .strict();

export type ChecklistData = z.infer<typeof ChecklistDataSchema>;

export const ChecklistApiDataSchema = RawFragmentSchema.extend({
  contentType: z.literal("Checklist"),
  contents: z.literal(""),
  isStateful: z.literal(true),
  childUris: z.array(z.string()).min(1),
  data: ChecklistDataSchema,
}).strict();

// Class ------------------------------------------------------------

/**
 * A fragment that renders as a checklist. The user can mark each step as complete.
 */
export class Checklist extends FragmentViaBxmlTag {
  bxmlNode: ChecklistTag;
  data: ChecklistData;
  childBxmlNodes: StepTag[];

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = ChecklistTagSchema.parse(params.bxmlNode);
    this.data = {
      completionContent: "You're finished! Nice work.",
    };
    this.convertToStatefulFragment();
    this.childBxmlNodes = this.bxmlNode.children;
  }
}

export const manifest = {
  contentType: "Checklist",
  tagName: "checklist",
  parsingClass: Checklist,
  exampleMarkupStrings: [exampleChecklistMarkup],
  apiDataSchema: ChecklistApiDataSchema,
  tagSchema: ChecklistTagSchema,
};
