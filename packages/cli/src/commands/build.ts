import { BoomboxParser } from "@b5x/parser";
import { copyFolderRecursiveSync } from "./fileUtils";
import fs from "fs";

// Just for dev purposes, this will be an S3 bucket when code is productionized

const B5X_API_TOPIC_ASSETS_FOLDER =
  "/Users/jengilbert/projects/b5x/packages/api/public/topic-assets";

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

function copyToClipboard(str: string) {
  var proc = require("child_process").spawn("pbcopy");
  proc.stdin.write(str);
  proc.stdin.end();
}

export const buildTopic = (topicSlug: string) => {
  // @ts-ignore
  const parser = new BoomboxParser({ commandDir: process.cwd(), topicSlug });
  publishTopicAssets(parser.topic.uri, parser.topicDir + "/images");
  const topicJson = parser.topic.packageForApi();
  copyToClipboard(JSON.stringify(topicJson));
  console.log("Topic contents copied to clipboard.");
};
