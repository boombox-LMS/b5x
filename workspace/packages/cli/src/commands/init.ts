const fs = require("fs");
const path = require("path");
const TOPIC_TEMPLATE_FOLDER_PATH = __dirname + "/../../templates/topic";
import { authorizeUser } from "./session";
import { copyFolderRecursiveSync } from "./fileUtils";
import readlineSync from "readline-sync";
import { NewTopicConfig } from "../types/topics";
import { spinalcase } from "stringcase";
import YAML from "yaml";

export const initTopic = () => {
  authorizeUser();
  // TODO: Register the slug with the API ...
  // Skipping this step for now to reduce cleanup

  const topicSlug = readlineSync.question(
    "Unique identifier for the topic's URL (e.g., my-new-topic): "
  );
  const topicConfig = buildTopicConfig(topicSlug);

  // Create a folder for the topic in the user's Terminal location, with default config
  const topicFolderPath = createTopicFolder({ slug: topicSlug });
  writeTopicConfig(topicConfig, topicFolderPath);
  console.log(`\nTopic successfully created in ${topicFolderPath}`);
  console.log(
    `Edit the documents in that folder to update your topic's content.`
  );
  console.log(
    `When the content is ready, you can publish it with 'b5x publish ${topicSlug}'.`
  );
};

// TODO: Disallow the running of this command while already inside another topic folder
function createTopicFolder(params: { slug: string }) {
  let target = process.cwd();
  let source = TOPIC_TEMPLATE_FOLDER_PATH;
  copyFolderRecursiveSync(source, target);
  fs.renameSync(target + "/topic", target + `/${params.slug}`);
  // TODO: Rewrite configfile values
  return target + `/${params.slug}`;
}

function buildTopicConfig(slug: string) {
  const title = readlineSync.question("Topic title: ");
  const subtitle = readlineSync.question("Topic subtitle (or short blurb): ");
  // const tagStr = readlineSync.question("Topic tags (comma separated): ")
  const topicConfig: NewTopicConfig = {
    slug,
    title,
    subtitle,
    coverImageUrl: "",
    groupAccessLevels: {
      assigned: ["all"], // TODO dangerous: This should be coded to allow access to JUST the author by default, this is just a workaround for demo
    },
    /*
    tags: tagStr.split(',').map(tag => {
      return tag.trim()
    })
    */
  };
  return topicConfig;
}

function writeTopicConfig(
  topicConfig: NewTopicConfig,
  topicFolderPath: string
) {
  const spinalCaseTopicConfig: any = {};
  for (const [key, value] of Object.entries(topicConfig)) {
    spinalCaseTopicConfig[spinalcase(key)] = value;
  }
  fs.writeFileSync(
    topicFolderPath + "/topic-config.yaml",
    YAML.stringify(spinalCaseTopicConfig)
  );
}
