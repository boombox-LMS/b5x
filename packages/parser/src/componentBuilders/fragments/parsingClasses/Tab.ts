import { FragmentViaBxmlTag } from "../abstractClasses/FragmentViaBxmlTag";
import { z } from "zod";
import { FragmentViaBxmlTagParams } from "../../../types/fragments";
import {
  BxmlTagNodeSchema,
  BxmlTextNodeSchema,
} from "../../../types/bxmlNodes";
import { RawFragmentSchema } from "@b5x/types";

/**
 * Example markup for the `tab` tag.
 */
export const exampleTabMarkup = `
<tab title='Tab 1 title'>
Tab 1 contents go here.

- Item 1
- Item 2
- Item 3
</tab>
`;

export const TabTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("tab"),
    attribs: z.object({ title: z.string() }).strict(),
    children: z.array(z.union([BxmlTagNodeSchema, BxmlTextNodeSchema])),
  })
  .strict();

export type TabTag = z.infer<typeof TabTagSchema>;

const TabDataSchema = z.object({ title: z.string() }).strict();

type TabData = z.infer<typeof TabDataSchema>;

export const TabApiDataSchema = RawFragmentSchema.extend({
  contentType: z.literal("Tab"),
  contents: z.literal(""),
  isRequired: z.literal(false),
  isStateful: z.literal(false),
  childUris: z.array(z.string()).min(1),
  data: TabDataSchema,
}).strict();

/**
 * A fragment that renders as a tab. Used only as a child of the Tabs fragment.
 */
export class Tab extends FragmentViaBxmlTag {
  bxmlNode: TabTag;
  data: TabData;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = TabTagSchema.parse(params.bxmlNode);
    this.data = { title: this.bxmlNode.attribs.title };
  }
}

export const manifest = {
  contentType: "Tab",
  tagName: "tab",
  exampleMarkupStrings: [exampleTabMarkup],
  apiDataSchema: TabApiDataSchema,
  tagSchema: TabTagSchema,
  parsingClass: Tab,
};
