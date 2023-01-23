import { FragmentViaBxmlTagParams } from "../../types/fragments";
import { FragmentViaBxmlTag } from "./FragmentViaBxmlTag";
import { z } from "zod";
import { BxmlTextNodeSchema } from "../../types/bxmlNodes";

// Markup -----------------------------------------------------------

/**
 * Example markup for the `mermaid-diagram` tag.
 * Only plaintext Mermaid markup is supported for now.
 * Boombox is capable of supporting FontAwesome icons,
 * but the Mermaid support itself for icons has some issues,
 * such as poor box sizing for nodes containing icons,
 * and some icons not showing up.
 *
 * Iconify support may be preferable, even if that
 * introduces a proprietary aspect to the markup.
 *
 * TODO: Add support for inline HTML that Mermaid supports,
 * such as <br> and <img> tags.
 */
export const exampleMermaidDiagramMarkup = `
<mermaid-diagram>
flowchart TD
    P1(Person 1 Paycheck)
    P2(Person 2 Paycheck)
    P1 --> P1401K(P1 401K contribution)
    JC(Joint checking account)
    P1 & P2 ---->|direct deposit| JC
    P2 --> P2401K(P2 401K contribution)
    JC --> I1(P1 weekly investment) --scheduled transaction-->P1V(P1 Vanguard account)
    JC ----> A1(P1 weekly allowance) --scheduled transaction--> C1(P1 checking)
    JC --> B("All household expenses (utilities, insurance, etc)")
    JC ----> A2(P2 weekly allowance) --scheduled transaction--> C2(P2 checking)
    JC --> I2(P2 weekly investment) --scheduled transaction-->P2V(P2 Vanguard account)
    C1 --> PE1(Clothes, shoes, takeout, etc.)
    C2 --> PE2(Clothes, shoes, takeout, etc.)
</mermaid-diagram>
`;

// Types ------------------------------------------------------------

const MermaidDiagramTagSchema = z.object({
  type: z.literal("tag"),
  name: z.literal("mermaid-diagram"),
  attribs: z.object({}).strict(),
  children: z.array(BxmlTextNodeSchema).length(1),
});

type MermaidDiagramTag = z.infer<typeof MermaidDiagramTagSchema>;

export const MermaidDiagramDataSchema = z.object({
  config: z.object({}).strict(),
});

type MermaidDiagramData = z.infer<typeof MermaidDiagramDataSchema>;

// Class ------------------------------------------------------------

/**
 *  A fragment that renders a Mermaid diagram.
 *
 *  Mermaid is a diagramming tool that renders complex diagrams from simple markup.
 *  Examples can be seen at https://mermaid.live.
 *
 *  @example
 *  <mermaid-diagram>
 *  step 1 --> step 2 --> step 3
 *  </mermaid-diagram>
 */
export class MermaidDiagram extends FragmentViaBxmlTag {
  bxmlNode: MermaidDiagramTag;
  data: MermaidDiagramData;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    this.bxmlNode = MermaidDiagramTagSchema.parse(params.bxmlNode);
    this.data = {
      config: {},
    };
    this.contents = this.bxmlNode.children[0].data;
    this.childBxmlNodes = [];
  }
}
