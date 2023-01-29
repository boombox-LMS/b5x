import { FragmentViaBxmlTag } from "../abstractClasses/FragmentViaBxmlTag";
import { z } from "zod";
import { FragmentViaBxmlTagParams } from "../../../types/fragments";
import { TabTagSchema, TabTag } from "./Tab";
import { RawFragmentSchema } from "@b5x/types";

/**
 * Example markup for the `tabs` tag.
 */
export const exampleTabsMarkup = `
<tabs>

<tab title='Tab 1 title'>
Tab 1 contents go here.

- Item 1
- Item 2
- Item 3
</tab>

<tab title='Tab 2 title'>
Tab 2 contents go here. Here's some **bold text**.
</tab>

<tab title='Tab 3 title'>
Tab 3 contents go here. Plus a [link](https://www.google.com).
</tab>

</tabs>
`;

const TabsTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("tabs"),
    attribs: z.object({}).strict(),
    children: z.array(TabTagSchema).min(1),
  })
  .strict();

type TabsTag = z.infer<typeof TabsTagSchema>;

export const TabsApiDataSchema = RawFragmentSchema.extend({
  contentType: z.literal("Tabs"),
  contents: z.literal(""),
  isRequired: z.literal(false),
  isStateful: z.literal(false),
  childUris: z.array(z.string()).min(1),
  data: z.object({}).strict(),
}).strict();

/**
 * A fragment that renders as a set of tabs
 * that the user can toggle between.
 */
export class Tabs extends FragmentViaBxmlTag {
  bxmlNode: TabsTag;
  childBxmlNodes: TabTag[];

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = TabsTagSchema.parse(params.bxmlNode);
    this.childBxmlNodes = this.bxmlNode.children;
    // this.convertToStatefulFragment()   TODO: It might be helpful to remember on page refresh which tab was active.
  }
}

export const manifest = {
  contentType: "Tabs",
  exampleMarkupStrings: [exampleTabsMarkup],
  apiDataSchema: TabsApiDataSchema,
  parsingClass: Tabs,
  tagName: "tabs",
  tagSchema: TabsTagSchema,
};
