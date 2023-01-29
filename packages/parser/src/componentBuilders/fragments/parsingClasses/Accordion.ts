import { FragmentViaBxmlTag } from "../abstractClasses/FragmentViaBxmlTag";
import { z } from "zod";
import { FragmentViaBxmlTagParams } from "../../../types/fragments";
import { AccordionItemTagSchema, AccordionItemTag } from "./AccordionItem";
import { RawFragmentSchema } from "@b5x/types";

/**
 * Example markup for the `accordion` tag.
 */
export const exampleAccordionMarkup = `
<accordion>

<item title='Panel 1 title'>
Panel 1 contents go here.
</item>

<item title='Panel 2 title'>
Panel 2 contents go here.
</item>

<item title='Panel 3 title'>
Panel 3 contents go here.
</item>

</accordion>
`;

const AccordionTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("accordion"),
    attribs: z.object({}).strict(),
    children: z.array(AccordionItemTagSchema).min(1),
  })
  .strict();

type AccordionTag = z.infer<typeof AccordionTagSchema>;

// TODO: Use the schema to validate the fragment when
// it's being built for the API? The schema could be
// added to the class as this.parsedJsonSchema, so
// it can be checked after the fragment JSON has been built.
const AccordionApiDataSchema = RawFragmentSchema.extend({
  contentType: z.literal("Accordion"),
  contents: z.literal(""),
  isRequired: z.literal(false),
  isStateful: z.literal(false),
  childUris: z.array(z.string()).min(1),
  data: z.object({}).strict(),
}).strict();

/**
 * A fragment that renders as a collapsed accordion,
 * with each section being optionally expandable by the user.
 */
export class Accordion extends FragmentViaBxmlTag {
  bxmlNode: AccordionTag;
  childBxmlNodes: AccordionItemTag[];

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    // rename item tags to accordion-item
    params.bxmlNode.children.forEach((childNode) => {
      if (childNode.type === "tag" && childNode.name === "item") {
        childNode.name = "accordion-item";
      }
    });
    this.bxmlNode = AccordionTagSchema.parse(params.bxmlNode);
    this.childBxmlNodes = this.bxmlNode.children;
    // this.convertToStatefulFragment()   TODO: It might be helpful to remember on page refresh which items were expanded.
  }
}

export const manifest = {
  contentType: "Accordion",
  tagName: "accordion",
  exampleMarkupStrings: [exampleAccordionMarkup],
  parsingClass: Accordion,
  tagSchema: AccordionTagSchema,
  apiDataSchema: AccordionApiDataSchema,
};
