import { FragmentViaBxmlTag } from "../abstractClasses/FragmentViaBxmlTag";
import { BxmlTextNodeSchema } from "../../../types/bxmlNodes";
import { z } from "zod";
import { FragmentViaBxmlTagParams } from "../../../types/fragments";
import { RawFragmentSchema } from "@b5x/types";

// Markup -----------------------------------------------------------

/**
 * Example markup for the `code-block` tag.
 */
export const exampleCodeBlockMarkup = `
<code-block language="javascript">
class Dog {
  constructor(name) {
    this.name = name
  }

  speak() {
    console.log("Woof!")
  }
}

const fido = new Dog('fido')
fido.speak()
</code-block>
`;

// Types ------------------------------------------------------------

const CodeBlockTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("code-block"),
    attribs: z
      .object({
        language: z.string().optional(),
      })
      .strict(),
    children: z.array(BxmlTextNodeSchema).length(1),
  })
  .strict();

type CodeBlockTag = z.infer<typeof CodeBlockTagSchema>;

export const CodeBlockDataSchema = z
  .object({
    language: z.string(),
  })
  .strict();

type CodeBlockData = z.infer<typeof CodeBlockDataSchema>;

export const CodeBlockApiDataSchema = RawFragmentSchema.extend({
  contentType: z.literal("CodeBlock"),
  contents: z.string(),
  data: CodeBlockDataSchema,
  isRequired: z.literal(false),
  isStateful: z.literal(false),
  childUris: z.array(z.any()).length(0),
}).strict();

// Class ------------------------------------------------------------

/**
 * A fragment that renders as a syntax-highlighted code block
 * and provides easy copy-paste functionality.
 */
export class CodeBlock extends FragmentViaBxmlTag {
  bxmlNode: CodeBlockTag;
  data: CodeBlockData;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = CodeBlockTagSchema.parse(params.bxmlNode);
    this.data = {
      language: this.#detectLanguage(),
    };
    this.contents = this.bxmlNode.children[0].data.trim();
    this.childBxmlNodes = [];
  }

  #detectLanguage() {
    return this.bxmlNode.attribs.language || "text";
  }
}

export const manifest = {
  contentType: "CodeBlock",
  tagName: "code-block",
  parsingClass: CodeBlock,
  exampleMarkupStrings: [exampleCodeBlockMarkup],
  tagSchema: CodeBlockTagSchema,
  apiDataSchema: CodeBlockApiDataSchema,
};
