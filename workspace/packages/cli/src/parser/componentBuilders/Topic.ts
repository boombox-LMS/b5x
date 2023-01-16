import { Document } from "./Document";
const htmlparser2 = require("htmlparser2");
import fs from "fs";
import { parse as parseYaml } from "yaml";
import { camelcase } from "stringcase";
import { Document as DomHandlerDocument } from "domhandler";
import { RawTopic, TopicConfig } from "@b5x/types";

/**
 *  Converts a Markdown file into the b5x format
 */
export class Topic {
  slug: string;
  version: string;
  dir: string;
  uri: string;
  documents: Document[];
  fragmentUrisByAlias: Record<string, string>;
  config: TopicConfig;
  // TODO: Shouldn't these be required properties?
  title?: string;
  subtitle?: string;
  coverImageUrl?: string;

  constructor(params: { slug: string; version: string; dir: string }) {
    // TODO: Get the slug from the config, not the folder name.
    // Also move the slug out of the config and into the cli-data since it should be read-only?
    this.slug = params.slug;
    this.fragmentUrisByAlias = {};
    this.version = params.version;
    this.uri = `${params.slug}-v${params.version}`;
    this.dir = params.dir;
    this.config = this.#parseConfig();
    this.documents = [];
    this.#buildDocuments();
    this.#finalizeConditions();
  }

  /**
   *  Enforces uniqueness of aliases within topic,
   *  and stores alias/uri data for final conditions processing.
   */
  registerFragmentAlias(params: { alias: string; uri: string }) {
    if (this.fragmentUrisByAlias[params.alias]) {
      throw `Cannot register author-assigned alias for fragment ${params.uri}: alias ${params.alias} has already been taken.`;
    }
    this.fragmentUrisByAlias[params.alias] = params.uri;
  }

  #parseConfig(): TopicConfig {
    // extract and format config
    const yamlStr = fs
      .readFileSync(this.dir + "/" + "topic-config.yaml")
      .toString();
    const spinecaseConfig = parseYaml(yamlStr);
    // TODO: Throw errors if the required attributes in the config are not present;
    // we have a list of valid keys, but we need a list of required keys.
    let config: any = {};
    Object.keys(spinecaseConfig).forEach((key) => {
      config[camelcase(key)] = spinecaseConfig[key];
    });

    // pull top-level attributes from the config
    // TODO: Just get rid of the config key?
    // It makes things complicated with little to no benefit
    const keysToHoist = [
      "title",
      "subtitle",
      // 'slug',
    ]; // AWKWARD: Slug is set twice, should it just not appear in the config file?

    keysToHoist.forEach((key) => {
      // @ts-ignore
      this[key] = config[key];
      delete config[key];
    });
    if (!config.contentMode) {
      config.contentMode = "tutorial";
    }

    // set defaults if not present
    const defaults = {
      groupAccessLevels: {},
      prerequisites: [],
    };

    // set the cover image url
    if (config.coverImage) {
      this.coverImageUrl = `http://localhost:8080/topic-assets/${this.uri}/images/${config.coverImage}`;
      delete config["coverImage"];
    }

    Object.keys(defaults).forEach((key) => {
      if (config[key] === undefined) {
        // @ts-ignore
        config[key] = defaults[key];
      }
    });

    return config as TopicConfig;
  }

  #buildDocuments() {
    const documentsDir = this.dir + "/documents";
    const docFilenames = fs.readdirSync(documentsDir);
    docFilenames.forEach((filename, i) => {
      this.#buildDocument({ dir: documentsDir, filename, order: i + 1 });
    });
  }

  #finalizeConditions() {
    this.documents.forEach((document) => {
      document.finalizeConditions(this.fragmentUrisByAlias);
    });
  }

  #buildDocument(params: { dir: string; filename: string; order: number }) {
    const docStr = fs
      .readFileSync(params.dir + "/" + params.filename)
      .toString();
    const match = params.filename.match(/\d*-?(.*).md/);
    if (match === null) {
      throw `Could not derive document slug from filename '${params.filename}'.`;
    }
    const slug = match[1];
    const domHandlerDocument: DomHandlerDocument = htmlparser2.parseDocument(
      docStr,
      { xmlMode: true }
    );
    this.documents.push(
      new Document({
        topic: this,
        slug,
        domHandlerDocument,
        order: params.order,
      })
    );
  }

  // TODO: Do I actually need to build the raw topic before populating fragment uris?
  // Seems like I could do it before the final rawTopic build, when everything else
  // has already been processed. It would be better not to have two steps of RawTopic
  // involved in shipping it.
  buildRawTopic(): RawTopic {
    return {
      uri: this.uri,
      slug: this.slug,
      version: this.version,
      title: this.title || "",
      config: this.config,
      subtitle: this.subtitle || "",
      coverImageUrl: this.coverImageUrl || "",
      documents: this.documents.map((document) => {
        return document.packageForApi();
      }),
    };
  }

  // TODO: Maybe just register all fragments with the topic
  // so this is a bit simpler? We already register the alias as it is
  // TODO: Refactor, this thing is getting long
  populateFragmentUris(rawTopic: RawTopic): RawTopic {
    // for every document ...
    rawTopic.documents.forEach((document) => {
      const localFragmentUris = Object.keys(document.fragmentsByUri);
      // loop through each fragment ...
      Object.values(document.fragmentsByUri).forEach((fragment) => {
        // and populate any requested fragment uri mappings
        if ("fragmentUrisByAlias" in fragment.data) {
          Object.keys(fragment.data.fragmentUrisByAlias).forEach(
            (fragmentAliasEntry) => {
              const fragmentUri = this.fragmentUrisByAlias[fragmentAliasEntry];
              if (!fragmentUri) {
                throw `Unable to populate a fragment uri for the requested alias ${fragmentAliasEntry}`;
              }
              fragment.data.fragmentUrisByAlias[fragmentAliasEntry] =
                fragmentUri;
              if (
                !localFragmentUris.includes(fragmentUri) &&
                !document.externalDependencyUris.includes(fragmentUri)
              ) {
                document.externalDependencyUris.push(fragmentUri);
              }
              // TODO: Add to the document's local dependency uris as well?
              // Does a document even need local dependency uris?
              // Isn't that just a list of all of its fragment uris?
              if (!fragment.dependencyUris.includes(fragmentUri)) {
                fragment.dependencyUris.push(fragmentUri);
              }
            }
          );
        }
      });
    });
    return rawTopic;
  }

  packageForApi(): { topic: RawTopic } {
    let rawTopic = this.buildRawTopic();
    rawTopic = this.populateFragmentUris(rawTopic);
    return { topic: rawTopic };
  }
}
