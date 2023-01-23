import { FragmentViaBxmlTag } from "./FragmentViaBxmlTag";
import { FragmentViaBxmlTagParams } from "../../types/fragments";
import { BxmlTextNodeSchema } from "../../types/bxmlNodes";
import { marked } from "marked";
import { z } from "zod";

// Markup -----------------------------------------------------------

/**
 * Example markup for the `troubleshooter` tag.
 *
 * TODOs:
 * - Pull issue title into issue tag as an attribute?
 * - Can we add the option to use a Markdown list for the steps if they're short?
 */
export const exampleTroubleshooterMarkup = `
<troubleshooter>
  <issue>
    <title>I don't see any failing tests.</title>
    <step>Verify that your test file name ends in \`_test.py\`.</step>
    <step>Use \`pwd\` to ensure that you aren't running tests in the wrong location.</step>
  </issue>
  <issue>
    <title>I get a "not authorized" error.</title>
    <step>Verify that you're on the VPN.</step>
    <step>Use \`which aws-okta\` to verify that aws-okta is installed on your system.</step>
  </issue>
</troubleshooter>
`;

// Types ------------------------------------------------------------

// TODO: How would it work to allow Markdown-accepted HTML tags
// in these sorts of tags? Maybe a preprocessing or refinement step
// where the multiple tags in the content become one rendered-html tag?
const StepTagSchema = z
  .object({
    name: z.literal("step"),
    type: z.literal("tag"),
    attribs: z.object({}),
    children: z.array(BxmlTextNodeSchema).length(1),
  })
  .strict();

type StepTag = z.infer<typeof StepTagSchema>;

const TitleTagSchema = z
  .object({
    name: z.literal("title"),
    type: z.literal("tag"),
    attribs: z.object({}).strict(),
    children: z.array(BxmlTextNodeSchema).length(1),
  })
  .strict();

type TitleTag = z.infer<typeof TitleTagSchema>;

const IssueTagSchema = z
  .object({
    name: z.literal("issue"),
    type: z.literal("tag"),
    attribs: z.object({}).strict(),
    children: z
      .array(z.union([TitleTagSchema, StepTagSchema]))
      .refine((tags) => {
        const tagCounts: Record<string, number> = {};
        tags.forEach((tag) => {
          if (tagCounts[tag.name]) {
            tagCounts[tag.name]++;
          } else {
            tagCounts[tag.name] = 1;
          }
        });
        return tagCounts["title"] === 1 && tagCounts["step"] >= 1;
      }),
  })
  .strict();

type IssueTag = z.infer<typeof IssueTagSchema>;

export const TroubleshooterDataSchema = z.object({
  issues: z
    .array(
      z
        .object({
          title: z.string(),
          steps: z.array(z.string()),
        })
        .strict()
    )
    .min(1),
});

type TroubleshooterData = z.infer<typeof TroubleshooterDataSchema>;

const TroubleshooterTagSchema = z
  .object({
    name: z.literal("troubleshooter"),
    type: z.literal("tag"),
    attribs: z.object({}).strict(),
    children: z.array(IssueTagSchema),
  })
  .strict();

type TroubleshooterTag = z.infer<typeof TroubleshooterTagSchema>;

// Class ------------------------------------------------------------

/**
 * A fragment that renders a troubleshooter to help the user debug common issues.
 */
export class Troubleshooter extends FragmentViaBxmlTag {
  bxmlNode: TroubleshooterTag;
  data: TroubleshooterData;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.isRequired = false;
    this.bxmlNode = TroubleshooterTagSchema.parse(params.bxmlNode);
    this.data = this.#buildData();
  }

  #buildData(): TroubleshooterData {
    const result = {
      issues: this.bxmlNode.children.map((issueTag) => {
        return this.#buildIssue(issueTag);
      }),
    };
    return TroubleshooterDataSchema.parse(result);
  }

  #buildIssue(issueTag: IssueTag) {
    let title: string = "";
    let steps: string[] = [];

    issueTag.children.forEach((issueTagChild) => {
      if (issueTagChild.name === "title") {
        title = marked.parse(issueTagChild.children[0].data);
      } else if (issueTagChild.name === "step") {
        steps.push(marked.parse(issueTagChild.children[0].data));
      }
    });

    return { title, steps };
  }
}
