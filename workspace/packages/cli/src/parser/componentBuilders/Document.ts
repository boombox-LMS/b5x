import { FragmentBuilder } from "./FragmentBuilder";
import { Fragment } from "./fragments/Fragment";
import { marked } from "marked";
const htmlparser2 = require("htmlparser2");
import { parse as parseYaml } from "yaml";
import md5 from "md5";
import { ConditionsHelper } from "@b5x/conditions-manager";
import {
  ConditionsList,
  DraftConditionsList,
  ContentMode,
  RawDocument,
  RawFragment,
} from "@b5x/types";
import { camelcase } from "stringcase";
import { Topic } from "./Topic";
import _ from "lodash";
import {
  Document as DomHandlerDocument,
  Element as DomHandlerElement,
  Text as DomHandlerText,
} from "domhandler";
import { Condition } from "@b5x/types";
import { coerceToBxmlNode } from "../../types/nodeCoercion";
import { BxmlNode, BxmlTagNode, BxmlTextNode } from "../../types/bxmlNodes";

export class Document {
  uri: string;
  slug: string;
  order: number;
  displayConditions: DraftConditionsList; // TODO: convert to ConditionsList for RawDocument?
  config: any;
  contentMode: ContentMode;
  topic: Topic;
  uriIncrementer: number;
  title: string;
  bxmlNode: BxmlTagNode;
  childFragments: Fragment[];

  constructor(params: {
    slug: string;
    domHandlerDocument: DomHandlerDocument;
    topic: Topic;
    order: number;
  }) {
    this.uri = params.topic.uri + "_" + params.slug;
    this.uriIncrementer = 0;
    this.slug = params.slug;
    this.order = params.order;
    this.topic = params.topic;
    this.bxmlNode = coerceToBxmlNode(params.domHandlerDocument) as BxmlTagNode;
    this.displayConditions = [];
    this.config = {};
    this.contentMode = params.topic.config.contentMode; // will be overridden if config tag differs
    this.childFragments = this.#buildFragments({
      bxmlNodes: this.bxmlNode.children,
    });
    if (this.contentMode === "tutorial") {
      this.#addDocumentCompletionContent();
    }
    this.#addDefaultDisplayConditions(this.childFragments);
    this.#registerFragmentAliases(this.childFragments);
    this.title = this.#detectTitle();
  }

  #addDocumentCompletionContent() {
    const completionFragment = new FragmentBuilder({
      uri: this.#getUniqueFragmentUri(),
      document: this,
      contentType: "DocumentCompletionContent",
    }).build();
    this.childFragments.push(completionFragment);
  }

  /**
   *  Collects a list of any external dependencies that the document relies on
   *  in order to display properly. An external dependency is any fragment or document
   *  not contained within the document's own tree.
   */
  #collectExternalDependencies() {
    const localUris = this.#collectLocalUris({ tree: this.childFragments });
    const fragmentDependencies = this.#collectAllFragmentDependencies(
      this.childFragments
    );
    const documentDependencies = ConditionsHelper.collectDependencies({
      conditions: this.displayConditions,
    });
    const allDependencies = _.union(fragmentDependencies, documentDependencies);
    return _.difference(allDependencies, localUris);
  }

  /**
   *  Collect an array of the fragment URIs in this document.
   */
  #collectLocalUris(params: { tree: Fragment[] }) {
    let localUris: string[] = [];
    params.tree.forEach((fragment) => {
      localUris = _.union(localUris, [fragment.uri]);
      if (fragment.childFragments.length > 0) {
        localUris = _.union(
          localUris,
          this.#collectLocalUris({ tree: fragment.childFragments })
        );
      }
    });
    return localUris;
  }

  /**
   *  Collect an array of all fragment dependencies,
   *  whether those dependencies are located in this document
   *  or elsewhere in the topic.
   */
  #collectAllFragmentDependencies(tree: Fragment[]) {
    let allDependencies: string[] = [];
    tree.forEach((fragment) => {
      allDependencies = _.union(
        allDependencies,
        ConditionsHelper.collectDependencies({
          conditions: fragment.displayConditions,
        })
      );
      if (fragment.childFragments.length > 0) {
        allDependencies = _.union(
          allDependencies,
          this.#collectAllFragmentDependencies(fragment.childFragments)
        );
      }
    });
    return allDependencies;
  }

  /*
  local_aliases = set()
  all_dependencies = set()
  for fragment in self.get_fragments():
      local_aliases.add(fragment.alias)
      all_dependencies = all_dependencies.union(set(fragment.get_dependency_aliases()))
  
  external_dependencies = list(all_dependencies.difference(local_aliases))
  return external_dependencies
  */

  #getUniqueFragmentUri(bxmlNode?: BxmlNode) {
    this.uriIncrementer++;
    if (bxmlNode && bxmlNode.type !== "text" && bxmlNode.attribs.id) {
      return `${this.uri}_${bxmlNode.attribs.id}`;
    }
    return `${this.uri}_f${this.uriIncrementer}`;
  }

  /**
   *  If the topic is a tutorial, block the display of any content
   *  that comes after a required input, so the user must complete inputs
   *  in order to reveal the next content.
   *
   *  TODO:
   *
   *  This works fine wouldn't quite work yet for nested content -- its approach
   *  will need to be more sophisticated to support deeply nested content.
   *  Another issue is that a nested "required" input should not actually be treated
   *  as required if it was never revealed by the user's answers.
   *
   *  The sophisticated version will need to involve more than one blocking fragment
   *  for nested fragments, but those blocking fragments should only be considered
   *  in visibility calculations if they have been displayed (and thus the user
   *  is accountable for completing them before revealing more content).
   */
  #addDefaultDisplayConditions(fragments: Fragment[]) {
    if (this.contentMode !== "tutorial") {
      return;
    }
    let blockingFragment: Fragment | null = null;

    fragments.forEach((fragment) => {
      if (blockingFragment) {
        let newCondition: Condition = {
          type: "condition",
          data: {
            uri: blockingFragment.uri,
            operator: "status-is",
            targetValue: "completed",
          },
        };
        fragment.displayConditions = ConditionsHelper.concatConditions(
          fragment.displayConditions,
          [newCondition]
        );
      }

      if (fragment.isRequired) {
        blockingFragment = fragment;
      }

      if (fragment.childFragments.length > 0) {
        this.#addDefaultDisplayConditions(fragment.childFragments);
      }
    });
  }

  #registerFragmentAliases(fragments: Fragment[]) {
    fragments.forEach((fragment) => {
      if (fragment.alias) {
        this.topic.registerFragmentAlias({
          alias: fragment.alias,
          uri: fragment.uri,
        });
      }
      if (fragment.childFragments.length > 0) {
        this.#registerFragmentAliases(fragment.childFragments);
      }
    });
  }

  finalizeConditions(fragmentUrisByAlias: Record<string, string>) {
    this.#finalizeDocumentDisplayConditions(fragmentUrisByAlias);
    this.#finalizeFragmentDisplayConditions({
      tree: this.childFragments,
      fragmentUrisByAlias,
    });
  }

  #finalizeDocumentDisplayConditions(
    fragmentUrisByAlias: Record<string, string>
  ) {
    this.displayConditions = ConditionsHelper.replaceAliasesWithUris(
      this.displayConditions,
      fragmentUrisByAlias
    );
  }

  #finalizeFragmentDisplayConditions(params: {
    tree: Fragment[];
    fragmentUrisByAlias: Record<string, string>;
  }) {
    const fragments = params.tree || this.childFragments;
    fragments.forEach((fragment) => {
      // TODO: Convert aliases to URIs within conditions
      fragment.displayConditions = ConditionsHelper.replaceAliasesWithUris(
        fragment.displayConditions,
        params.fragmentUrisByAlias
      );
      if (fragment.childFragments.length > 0) {
        this.#finalizeFragmentDisplayConditions({
          tree: fragment.childFragments,
          fragmentUrisByAlias: params.fragmentUrisByAlias,
        });
      }
    });
  }

  /**
   *  Autodetects the title from the document's HTML content.
   *  The title is taken from the config if a title is defined there,
   *  or taken from the first H1 in the document.
   */
  #detectTitle() {
    let title;

    // use the title in the config, if present
    if (this.config.title) {
      title = this.config.title;
      delete this.config.title;
      return title;
    }

    // assign default title, keep if document is blank
    const defaultTitle = `Document ${this.order}`;
    title = defaultTitle;

    // loop through document contents in search of an H1
    // to use as the title
    for (let i = 0; i < this.bxmlNode.children.length; i++) {
      if (title !== defaultTitle) {
        break;
      }

      const childTag = this.bxmlNode.children[i];
      if (childTag.type !== "text") {
        continue;
      } else {
        const heading = this.#extractHeading(childTag);
        if (heading) {
          title = heading;
        }
      }
    }

    return title;
  }

  #extractHeading(textNode: BxmlTextNode) {
    let heading = null;
    const htmlStr = marked.parse(textNode.data);
    const rootElement: DomHandlerDocument = htmlparser2.parseDocument(htmlStr);
    if (rootElement.children !== undefined) {
      rootElement.children.forEach((childTag) => {
        if ("name" in childTag && childTag.name === "h1") {
          // TODO: This will break if the heading text has additional inline formatting,
          // like bold, italic, etc.
          if (
            childTag.type === "tag" &&
            childTag.children !== undefined &&
            childTag.children[0].type === "text"
          ) {
            heading = childTag.children[0].data;
          }
        }
      });
    }
    return heading;
  }

  #parseConfig(configTag: BxmlTagNode) {
    if (configTag.children.length === 0) {
      console.log(configTag);
      throw `Cannot parse above configTag: tag appears to have no children.`;
    }
    if (configTag.children[0].type !== "text") {
      console.log(configTag);
      throw `Cannot parse above configTag: expected text contents only.`;
    }
    const yamlStr = configTag.children[0].data;
    let config = parseYaml(yamlStr);
    // camelcase the keys
    Object.keys(config).forEach((key) => {
      const newKey = camelcase(key);
      if (newKey !== key) {
        config[newKey] = config[key];
        delete config[key];
      }
    });
    // hoist the display conditions
    if (config.showIf) {
      this.displayConditions = ConditionsHelper.buildConditions(config.showIf);
      delete config.showIf;
    }
    // hoist the content mode
    if (config.contentMode) {
      this.contentMode = config.contentMode;
      delete config.contentMode;
    }
    this.config = config;
  }

  #buildFragments(params: { bxmlNodes: BxmlNode[] }): Fragment[] {
    const document = this;
    let builtFragments: Fragment[] = [];

    params.bxmlNodes.forEach((bxmlNode) => {
      // reroute the document's config tag,
      // as it does not belong in the content tree
      // TODO: Kill document config tags entirely in favor of full-document show tags
      if (bxmlNode.type === "tag" && bxmlNode.name === "config") {
        this.#parseConfig(bxmlNode);
        return;
      }

      // skip comments, they're intended for the markup only
      if (bxmlNode.type === "tag" && bxmlNode.name === "comment") {
        return;
      }

      const fragment = new FragmentBuilder({
        uri: this.#getUniqueFragmentUri(bxmlNode),
        bxmlNode,
        document,
      }).build();
      fragment.childFragments = this.#buildFragments({
        bxmlNodes: fragment.childBxmlNodes,
      });

      builtFragments.push(fragment);
    });

    // remove any blank HTML fragments
    builtFragments = builtFragments.filter((fragment) => {
      return (
        fragment.contentType !== "MarkdownContent" || fragment.contents !== ""
      );
    });

    // combine any combinable tags
    builtFragments = this.#combineFragments(builtFragments);

    return builtFragments;
  }

  /**
   *  Simplifies a list of fragments by combinining any compatible fragments --
   *  for example, two HTMLContent fragments that have the same display conditions.
   */
  #combineFragments(fragments: Fragment[]) {
    let combinedFragments = [];
    let prevFragment = null;

    for (let i = 0; i < fragments.length; i++) {
      const fragment = fragments[i];
      // skip to next if there's no previous item to combine with
      if (!prevFragment) {
        prevFragment = fragment;
        continue;
      }

      // if prev fragment is not compatible, save it without combining
      if (!prevFragment.canCombineWith(fragment)) {
        combinedFragments.push(prevFragment);
        prevFragment = fragment;
        continue;
      }

      // otherwise, combine the two fragments to make a new prevFragment
      // that will potentially combine with the next fragment as well
      // @ts-ignore
      const { uri, bxmlNode, data, displayConditions, contentType } =
        prevFragment.combineWith(fragment);
      prevFragment = new FragmentBuilder({
        uri,
        bxmlNode,
        data,
        displayConditions,
        contentType,
        document: this,
      }).build();
    }

    // add the tailing fragment if there is one
    if (prevFragment) {
      combinedFragments.push(prevFragment);
    }

    return combinedFragments;
  }

  get contentDigest() {
    let digestData = {
      title: this.title,
      childDigests: this.childFragments.map((fragment) => {
        return fragment.contentDigest;
      }),
    };
    return md5(JSON.stringify(digestData));
  }

  // TODO: This is fine for the prototype, but
  // the actual completion conditions are more complex for nested content,
  // as also noted for the display conditions (which have the same issue).
  #calculateCompletionConditions() {
    let lastFragment = this.childFragments[this.childFragments.length - 1];
    let conditions = lastFragment.displayConditions;
    if (lastFragment.isRequired) {
      conditions = ConditionsHelper.concatConditions(conditions, [
        {
          type: "condition",
          data: {
            uri: lastFragment.uri,
            operator: "is",
            targetValue: "$completed",
          },
        },
      ]);
    }
    return conditions;
  }

  #collectRawFragmentsByUri(fragments: Fragment[]) {
    let rawFragmentsByUri: Record<string, RawFragment> = {};
    fragments.forEach((fragment) => {
      rawFragmentsByUri[fragment.uri] = fragment.packageForApi();
      rawFragmentsByUri = _.merge(
        rawFragmentsByUri,
        this.#collectRawFragmentsByUri(fragment.childFragments)
      );
    });
    return rawFragmentsByUri;
  }

  /**
   *  Converts the document into a vanilla data structure that can be consumed by the API.
   */
  packageForApi(): RawDocument {
    return {
      uri: this.uri,
      topicUri: this.topic.uri,
      slug: this.slug,
      order: this.order,
      config: this.config,
      title: this.title,
      displayConditions: this.displayConditions as ConditionsList,
      childUris: this.childFragments.map((fragment) => {
        return fragment.uri;
      }),
      digest: this.contentDigest,
      contentMode: this.contentMode,
      completionConditions: this.#calculateCompletionConditions(),
      externalDependencyUris: this.#collectExternalDependencies(),
      dependencyUris: ConditionsHelper.collectDependencies({
        conditions: this.displayConditions,
      }),
      fragmentsByUri: this.#collectRawFragmentsByUri(this.childFragments),
    };
  }
}
