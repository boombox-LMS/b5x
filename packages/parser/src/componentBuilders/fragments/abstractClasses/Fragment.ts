import md5 from "md5";
import { render } from "dom-serializer";
import { ConditionsHelper } from "@b5x/conditions-manager";
import {
  ConditionsList,
  RawFragment,
  ConditionsListSchema,
  FragmentContentType,
  RawFragmentSchema,
} from "@b5x/types";
const htmlparser2 = require("htmlparser2");
import {
  FragmentParams,
  FragmentParamsSchema,
  FragmentCombinationResult,
} from "../../../types/fragments";
import { Document } from "../../Document";
import { BxmlNode } from "../../../types/bxmlNodes";
import { coerceToBxmlNode } from "../../../types/nodeCoercion";
const _ = require("lodash");

const IMAGE_REGEX = /\.(gif|jpe?g|tiff?|png|webp|bmp|svg)$/i;
const ICONIFY_REGEX = /(.*):(.*)/;

/**
 * This class is an abstract parent class,
 * providing default values and functions that can be
 * overridden in the child classes that extend it.
 * It was not designed to be instantiated directly.
 */
export class Fragment {
  displayConditions: ConditionsList;
  data: any;
  isStateful: boolean;
  isRequired: boolean;
  contents: string;
  childFragments: Fragment[];
  uri: string;
  contentType: FragmentContentType;
  alias: string | null;
  document: Document;
  bxmlNode?: BxmlNode;
  childBxmlNodes: BxmlNode[];
  combinesWith: any; // TODO: Not sure why TS is unhappy with Record<FragmentContentType, Function> here, which is the actual type
  apiDataSchema: any;

  /**
   *  Child fragments should call this constructor function as well
   *  even if they also have their own constructor logic. It sets all
   *  required params, and sets intelligent defaults for the rest.
   */
  constructor(params: FragmentParams) {
    params = FragmentParamsSchema.parse(params);
    /**
     * Which content types this fragment can be combined with, for efficiency or proper spacing.
     * For example, <templated-value> tags are processed separately initially,
     * then combined with any surrounding Markdown fragments in order to maintain the correct inline spacing.
     */
    // @ts-ignore, not sure why TS is unhappy with an empty record here
    this.combinesWith = {};
    this.document = params.document;
    this.contentType = params.contentType || "UnknownFragment";
    this.alias = params.alias || this.#detectAlias(params);
    this.uri = params.uri;
    this.contents = params.contents || "";
    this.displayConditions = params.displayConditions || [];
    ConditionsListSchema.parse(this.displayConditions);
    this.data = params.data || {};
    this.isStateful = false;
    this.isRequired = false;
    /**
     *  To avoid circular import dependencies,
     *  any child fragments must be built by the parent document,
     *  then attached, so childFragments always starts out empty.
     *  TODO: Is the above still true, or in JS can fragments
     *  build their own children?
     */
    this.childFragments = [];
    this.childBxmlNodes = [];
    this.apiDataSchema = RawFragmentSchema;
  }

  #detectAlias(params: FragmentParams) {
    if (params.bxmlNode && "attribs" in params.bxmlNode) {
      if (typeof params.bxmlNode.attribs.id === "string") {
        return params.bxmlNode.attribs.id;
      } else if (params.bxmlNode.attribs.id === undefined) {
        return null;
      } else {
        console.log(params.bxmlNode);
        throw `Invalid id attribute on above tag: ${params.bxmlNode.attribs.id}`;
      }
    } else {
      return null;
    }
  }

  /**
   *  Some types of fragments, like HTML fragments,
   *  can be combined into one fragment if they are siblings,
   *  but the default value is false.
   */
  canCombineWith(fragment: Fragment) {
    const compatibleContentTypes = Object.keys(this.combinesWith);
    return (
      _.isEqual(fragment.displayConditions, this.displayConditions) &&
      compatibleContentTypes.includes(fragment.contentType)
    );
  }

  /**
   * Mark this fragment as a stateful fragment.
   * Stateful fragments are required by default,
   * but this can be overridden in the args.
   */
  convertToStatefulFragment(
    params: { isRequired: boolean } = { isRequired: true }
  ) {
    this.isStateful = true;
    this.isRequired = params.isRequired;
  }

  /**
   * Concats the contents of two fragments,
   * and creates and returns an object that can be used to initialize a new fragment.
   * Occasionally useful for reducing the overall number of fragments in a topic,
   * which reduces data usage and improves performance.
   * Also preserves the inline arrangement of fragments meant to be displayed
   * continuously; during final processing, any Markdown is wrapped in a p tag,
   * which means any inline fragments must have been combined by that stage.
   */
  combineWith(fragment: Fragment) {
    if (!(fragment.contentType in this.combinesWith)) {
      throw `Cannot run combineWith against fragment of an incompatible type of ${fragment}`;
    }

    let result: FragmentCombinationResult;

    let { uri, data, displayConditions } = this;
    // TODO: Seems like alias info should be moved up to the topic level?
    // TODO: Combine fragment data more safely to ensure that this is the only differing key
    data.fragmentUrisByAlias = _.merge(
      data.fragmentUrisByAlias,
      fragment.data.fragmentUrisByAlias
    );
    let contentType: FragmentContentType = "UnknownFragment";
    let bxmlNode = coerceToBxmlNode(
      htmlparser2.parseDocument(this.rawContents + fragment.rawContents, {
        xmlMode: true,
      })
    );

    result = { uri, data, displayConditions, contentType, bxmlNode };

    // pop off the root tag if the parsing call above added one to a single text tag
    if (
      result.bxmlNode.type === "root" &&
      result.bxmlNode.children.length === 1
    ) {
      result.bxmlNode = result.bxmlNode.children[0];
    }

    const combinationCallback =
      this.combinesWith[fragment.contentType].combinationCallback;
    if (!combinationCallback) {
      throw `No combination callback found for the combination of ${fragment.contentType} with ${this.contentType} (this fragment).`;
    }

    result = this.combinesWith[fragment.contentType].combinationCallback(
      fragment,
      this,
      result
    );
    return result;
  }

  /*
  getTagAsHtmlString(tag: DomElement) {
    let contents = ''

    // Base case 1: Empty tag
    if (tag.children === undefined && tag.type !== 'text') {
      return contents;
    }

    // Base case 2: Plain Markdown text
    if (tag.type === 'text') {
      contents += marked.parse(tag.data)
    }

    if (tag.name !== undefined) {
      contents += `<${tag.name}>`
      if (tag.children !== undefined) {
        tag.children.forEach(childTag => {
          contents += this.getTagAsHtmlString(childTag)
        })
      }
      contents += `</${tag.name}>`
    }

    return contents
  }
  */

  /**
   *  This is the fragment's opportunity to rearrange itself
   *  from the form it took in the constructor. For example, it might
   *  add information to its data attribute, absorbing its child tags in the process.
   *  This is also when any remaining child tags are propagated
   *  for recursive parsing, by being assigned to the childTags attribute.
   *
   *  The fragment should NOT set its own childFragments attribute;
   *  to avoid circular dependencies,
   *  these fragments are built externally and attached.
   */
  build() {
    return;
  }

  /**
   *  Some child classes may need to generate final HTML from Markdown, etc.
   *  This step is saved for last because it's easier to combine Markdown fragments
   *  than to combine HTML fragments.
   */
  get finalizedContents() {
    return this.contents;
  }

  get renderedContents() {
    return this.contents;
  }

  get rawContents() {
    if (this.bxmlNode) {
      // @ts-ignore
      return render(this.bxmlNode);
    } else {
      return "";
    }
  }

  get contentDigest(): string {
    let digestData = {
      contentType: this.contentType,
      isStateful: this.isStateful,
      isRequired: this.isRequired,
      finalizedContents: this.finalizedContents,
      data: this.data,
      contents: this.contents,
      childDigests: this.childFragments.map((fragment) => {
        return fragment.contentDigest;
      }),
    };
    return md5(JSON.stringify(digestData));
  }

  // TODO: Add documentation comment, and have the Diagram fragment utilize this as well
  getImageUrlFromAssetName(assetName: string) {
    if (IMAGE_REGEX.test(assetName)) {
      return `http://localhost:8080/topic-assets/${this.document.topic.uri}/images/${assetName}`;
    } else if (ICONIFY_REGEX.test(assetName)) {
      const match = assetName.match(ICONIFY_REGEX);
      // @ts-ignore
      const iconPrefix = match[1];
      // @ts-ignore
      const iconName = match[2];
      return `https://api.iconify.design/${iconPrefix}/${iconName}.svg`;
    } else {
      throw `Unable to build image URL from asset name: unrecognized asset '${assetName}'.`;
    }
  }

  /**
   *  Represent the fragment as a JSON blob for shipping to the web app.
   */
  packageForApi(): RawFragment {
    const json = {
      uri: this.uri,
      documentUri: this.document.uri,
      displayConditions: this.displayConditions,
      data: this.data,
      contentType: this.contentType,
      isStateful: this.isStateful,
      isRequired: this.isRequired,
      childUris: this.childFragments.map((child) => {
        return child.uri;
      }),
      contents: this.finalizedContents,
      digest: this.contentDigest,
      dependencyUris: ConditionsHelper.collectDependencies({
        conditions: this.displayConditions,
      }),
    };
    return json;
    // TODO: Enable this once all of the fragment schemas have been defined
    // and set as this.apiDataSchema within the parsing classes
    // return this.apiDataSchema.parse(json);
  }
}
