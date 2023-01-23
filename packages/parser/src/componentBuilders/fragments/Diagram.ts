import { FragmentViaBxmlTagParams } from "../../types/fragments";
import { FragmentViaBxmlTag } from "./FragmentViaBxmlTag";
import { z } from "zod";

// Markup -----------------------------------------------------------

/**
 * Example markup for the `diagram` tag.
 */
export const exampleDiagramMarkup = `
<diagram>
  <item id=client label=Client shape=ic:baseline-phone-android col=1 row=2>
    <line to=lb arrow=both label=http />
  </item>

  <item id=lb label='Load balancer' shape=carbon:network-2 col=3 row=2 />

  <items shape=mingcute:server-line label='App server' col=5>
    <item id=server1 row=1 />
    <item id=server2 row=2 />
    <item id=server3 row=3 />
    <line to=lb arrow=both label=http />
    <line to=db arrow=both label=http />
  </items>

  <item id=db label=Database shape=mdi:database-outline col=7 row=2 />
</diagram>
`;

// Types ------------------------------------------------------------

const NestedLineTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("line"),
    attribs: z
      .object({
        to: z.string(),
        arrow: z.string().optional(),
        label: z.string().optional(),
      })
      .strict(),
    children: z.array(z.any()).length(0),
  })
  .strict();

const LineTagSchema = NestedLineTagSchema.extend({
  attribs: z
    .object({
      to: z.string(),
      arrow: z.string().optional(),
      label: z.string().optional(),
      from: z.string(),
    })
    .strict(),
}).strict();

type LineTag = z.infer<typeof LineTagSchema>;

const ItemTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("item"),
    attribs: z
      .object({
        id: z.string(), // TODO: Can make this optional and use an md5 instead?
        label: z.string().optional(),
        shape: z.string().optional(),
        col: z.string().optional(),
        row: z.string().optional(),
      })
      .strict(),
    children: z.array(NestedLineTagSchema),
  })
  .strict();

type ItemTag = z.infer<typeof ItemTagSchema>;

const ItemsTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("items"),
    attribs: z
      .object({
        shape: z.string().optional(),
        label: z.string().optional(),
        col: z.string().optional(),
        row: z.string().optional(),
      })
      .strict(),
    // todo: Add refinement to verify the presence of at least two item tags
    children: z.array(z.union([NestedLineTagSchema, ItemTagSchema])).min(2),
  })
  .strict();

type ItemsTag = z.infer<typeof ItemsTagSchema>;

// TODO: Use .refine to validate the connections between everything --
// a line needs to refer to a node ID, for example
const DiagramTagSchema = z
  .object({
    type: z.literal("tag"),
    name: z.literal("diagram"),
    attribs: z.object({}),
    children: z.array(z.union([ItemTagSchema, LineTagSchema, ItemsTagSchema])),
  })
  .strict();

type DiagramTag = z.infer<typeof DiagramTagSchema>;

const ExpandedDiagramTagSchema = DiagramTagSchema.extend({
  children: z.array(z.union([ItemTagSchema, LineTagSchema])).min(1),
}).strict();

/**
 * A diagram tag that has had its `items` and `item` tags
 * expanded into individual tags, with nested tags no longer present.
 */
type ExpandedDiagramTag = z.infer<typeof ExpandedDiagramTagSchema>;

const AnyDiagramTagSchema = z.union([
  ItemTagSchema,
  ItemsTagSchema,
  LineTagSchema,
  NestedLineTagSchema,
]);

type AnyDiagramTag = z.infer<typeof AnyDiagramTagSchema>;

const DiagramEdgeSchema = z.object({
  group: z.literal("edges"),
  data: z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    label: z.string().optional(),
  }),
  classes: z.array(z.string()),
});

/**
 * A diagram edge that can be rendered by the Cytoscape.js library.
 */
type DiagramEdge = z.infer<typeof DiagramEdgeSchema>;

const DiagramNodeSchema = z.object({
  group: z.literal("nodes"),
  data: z.object({
    id: z.string(),
    col: z.string().optional(),
    row: z.string().optional(),
    label: z.string().optional(),
    parent: z.string().optional(),
  }),
  classes: z.array(z.string()),
});

/**
 * A diagram node that can be rendered by the Cytoscape.js library.
 */
type DiagramNode = z.infer<typeof DiagramNodeSchema>;

export const DiagramDataSchema = z.object({
  elements: z.array(z.union([DiagramEdgeSchema, DiagramNodeSchema])),
  stylesheet: z.array(
    z.object({
      selector: z.string(),
      style: z.record(z.any()),
    })
  ),
});

type DiagramData = z.infer<typeof DiagramDataSchema>;

// Class ------------------------------------------------------------

const TEXT_ONLY_NODE_CLASS = "node--text-only";
const ICON_NODE_CLASS = "node--icon";
const SOURCE_ARROW_CLASS = "edge--source-arrow";
const TARGET_ARROW_CLASS = "edge--target-arrow";
const HORIZONTAL_EDGE_CLASS = "edge--horizontal";
const IMAGE_REGEX = /\.(gif|jpe?g|tiff?|png|webp|bmp|svg)$/i;
const ICONIFY_REGEX = /(.*):(.*)/;

/**
 * The class responsible for building a fragment that can be used
 * to display a Cytoscape diagram. You can learn more about
 * Cytoscape diagrams at https://js.cytoscape.org/.
 *
 * Diagrams are made up of `<item>` tags that become nodes,
 * and `<line>` tags that become edges.
 *
 * The `<items>` tag can be used to wrap a collection of items
 * that have the same properties. Any `<line>` tag appearing inside
 * an `<items>` tag will create an edge originating from *each*
 * item in the set.
 */
export class Diagram extends FragmentViaBxmlTag {
  bxmlNode: ExpandedDiagramTag;
  data: DiagramData;

  constructor(params: FragmentViaBxmlTagParams) {
    super(params);
    const diagramTag = DiagramTagSchema.parse(params.bxmlNode);
    this.bxmlNode = ExpandedDiagramTagSchema.parse(
      this.#expandDiagramTag(diagramTag)
    );
    this.data = this.#buildData();
    this.childBxmlNodes = [];
    this.convertToStatefulFragment({ isRequired: false }); // TODO: Split Diagram into static and stateful versions?
  }

  /**
   * The top-level build function for the diagram.
   * It processes all of the tags in the diagram's markup,
   * organizing them into valid Cytoscape diagram data.
   */
  #buildData() {
    let result: DiagramData = {
      elements: [],
      stylesheet: [],
    };

    this.bxmlNode.children.forEach((childTag) => {
      switch (childTag.name) {
        case "item":
          const { containerNode, contentNode } = this.#buildNode(childTag);
          result.elements.push(containerNode);
          result.elements.push(contentNode);
          if (childTag.attribs.shape) {
            result.stylesheet.push(
              this.#buildItemStylesheet(
                contentNode.data.id,
                childTag.attribs.shape
              )
            );
          }
          break;
        case "line":
          result.elements.push(this.#buildEdge(childTag));
          break;
      }
    });

    result = DiagramDataSchema.parse(result);
    return this.#optimizeDiagramAppearance(result);
  }

  /**
   * Converts `<item>` tag data into valid Cytoscape diagram data.
   *
   * TODO: This assumes every node is an icon, but there could be text-only nodes as well.
   */
  #buildNode(tag: ItemTag) {
    const { id, col, row, label } = tag.attribs;

    // create parent node (wrapper node)
    let parentNode: DiagramNode = {
      group: "nodes",
      data: { id, col, row },
      classes: [],
    };

    // create child node (content node)
    const childId = `${id}-content`;
    let node: DiagramNode = {
      group: "nodes",
      data: { id: childId, label, parent: id, col, row },
      classes: [ICON_NODE_CLASS],
    };

    return {
      containerNode: parentNode,
      contentNode: node,
    };
  }

  /**
   * Converts `<line>` tag data into valid Cytoscape edge data.
   *
   * @param tag - A `<line>` DomElement
   */
  #buildEdge(lineTag: LineTag): DiagramEdge {
    const { from: source, to: target, label } = lineTag.attribs;
    const edgeId = `${source}-${target}-${
      label ? label.replace(/\s+/g, "") : ""
    }`;

    // build edge
    let edge: DiagramEdge = {
      group: "edges",
      data: { source, target, label, id: edgeId },
      classes: [],
    };
    // @ts-ignore
    switch (lineTag.attribs.arrow) {
      case "both":
        edge.classes.push(SOURCE_ARROW_CLASS);
        edge.classes.push(TARGET_ARROW_CLASS);
        break;
      case "target":
        edge.classes.push(TARGET_ARROW_CLASS);
        break;
      case "source":
        edge.classes.push(SOURCE_ARROW_CLASS);
        break;
    }

    return edge;
  }

  /**
   * If a node uses an image asset as its shape (instead of a rectangle or similar),
   * this function adds the asset's data to the diagram's stylesheet.
   */
  #buildItemStylesheet(id: string, shape: string) {
    let stylesheet;
    if (IMAGE_REGEX.test(shape) || ICONIFY_REGEX.test(shape)) {
      stylesheet = {
        selector: `#${id}`,
        style: {
          // temporary, these assets will actually be pushed to S3
          backgroundImage: this.getImageUrlFromAssetName(shape),
          backgroundFit: "contain",
        },
      };
    } else {
      stylesheet = {
        selector: `#${id}`,
        style: { shape },
      };
    }

    return stylesheet;
  }

  #optimizeDiagramAppearance(diagramData: DiagramData): DiagramData {
    const optimizedDiagramData: DiagramData = {
      elements: [],
      stylesheet: [],
    };

    let nodesById: Record<string, DiagramNode> = {};
    let edges: DiagramEdge[] = [];
    diagramData.elements.forEach((element) => {
      if (element.group === "nodes") {
        nodesById[element.data.id] = element;
      } else if (element.group === "edges") {
        edges.push(element);
      }
    });

    // Lift the edge label above any horizontal edges
    // to keep the label from obscuring short edges
    edges.forEach((edge) => {
      const sourceNode = nodesById[edge.data.source];
      const targetNode = nodesById[edge.data.target];
      if (sourceNode.data.row === targetNode.data.row) {
        edge.classes.push(HORIZONTAL_EDGE_CLASS);
      }
    });

    optimizedDiagramData.stylesheet = diagramData.stylesheet;
    optimizedDiagramData.elements = [...Object.values(nodesById), ...edges];
    return DiagramDataSchema.parse(optimizedDiagramData);
  }

  /**
   * Simplify the DiagramTag's children to just ItemTag and LineTag
   * by unpacking any nested items into their individual tags.
   */
  #expandDiagramTag(diagramTag: DiagramTag) {
    let expandedChildren: (ItemTag | LineTag)[] = [];
    diagramTag.children.forEach((childTag) => {
      if (childTag.name === "line") {
        expandedChildren.push(childTag);
      } else if (childTag.name === "items") {
        expandedChildren = [
          ...expandedChildren,
          ...this.#expandItemsTag(childTag),
        ];
      } else if (childTag.name === "item") {
        expandedChildren = [
          ...expandedChildren,
          ...this.#expandItemTag(childTag),
        ];
      }
    });
    diagramTag.children = expandedChildren;
    return ExpandedDiagramTagSchema.parse(diagramTag);
  }

  /**
   * Convert an ItemsTag into Item or Line tags,
   * applying the attributes of the Items tag to every nested Item,
   * and converting each nested Line tag into an array of Lines (one for every nested Item).
   */
  #expandItemsTag(itemsTag: ItemsTag): (ItemTag | LineTag)[] {
    const resultingItems: ItemTag[] = [];
    const resultingLines: LineTag[] = [];
    // Build item tags, merging their attributes with the parent items tag
    itemsTag.children.forEach((tag) => {
      if (tag.name === "item") {
        tag.attribs = { ...itemsTag.attribs, ...tag.attribs };
        resultingItems.push(tag);
      }
    });
    // Multiple line tags across items
    itemsTag.children.forEach((tag) => {
      if (tag.name === "line") {
        resultingItems.forEach((itemTag) => {
          resultingLines.push({
            ...tag,
            attribs: { ...tag.attribs, from: itemTag.attribs.id },
          });
        });
      }
    });
    return [...resultingItems, ...resultingLines];
  }

  /**
   * Pull out any nested Line tags from within the Item tag.
   */
  #expandItemTag(itemTag: ItemTag) {
    const resultingItems: (ItemTag | LineTag)[] = [];
    itemTag.children.forEach((nestedLineTag) => {
      resultingItems.push({
        ...nestedLineTag,
        attribs: { ...nestedLineTag.attribs, from: itemTag.attribs.id },
      });
    });
    itemTag.children = [];
    resultingItems.push(itemTag);
    return resultingItems;
  }
}
