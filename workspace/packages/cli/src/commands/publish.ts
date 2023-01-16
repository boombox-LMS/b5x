import { BoomboxParser } from "../parser/BoomboxParser";
import { authorizeUser } from "./session";
import { copyFolderRecursiveSync } from "./fileUtils";
import fs from "fs";

// Just for dev purposes, this will be an S3 bucket when code is productionized
const B5X_API_TOPIC_ASSETS_FOLDER =
  "/Users/jengilbert/projects/boombox-lms/workspace/packages/api/public/topic-assets";

export const publishTopicAssets = (
  topicUri: string,
  topicAssetsDir: string
) => {
  let source = topicAssetsDir;
  let target = B5X_API_TOPIC_ASSETS_FOLDER + "/" + topicUri;
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target);
  }
  copyFolderRecursiveSync(source, target);
};

export const publishTopic = (topicSlug: string) => {
  // authorizeUser()
  // TODO: Pull and pass credentials
  // @ts-ignore
  const parser = new BoomboxParser({ commandDir: process.cwd(), topicSlug });
  publishTopicAssets(parser.topic.uri, parser.topicDir + "/images");
  parser.publishTopic();
  // parser.writeTopicFile()
};
