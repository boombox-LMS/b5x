import { BoomboxParser } from "@b5x/parser";
import { copyFolderRecursiveSync } from "./fileUtils";
import fs from "fs";

// Just for dev purposes, this will be an S3 bucket when code is productionized
const B5X_API_TOPIC_ASSETS_FOLDER =
  "/Users/jengilbert/projects/b5x/packages/api/public/topic-assets";

const TOPIC_CONFIG_FILENAME = "topic-config.yaml";

export const publishTopicAssets = (
  topicUri: string,
  topicAssetsDir: string
) => {
  let source = topicAssetsDir;
  let target = B5X_API_TOPIC_ASSETS_FOLDER + "/" + topicUri;
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  copyFolderRecursiveSync(source, target);
};

function copyToClipboard(str: string) {
  var proc = require("child_process").spawn("pbcopy");
  proc.stdin.write(str);
  proc.stdin.end();
}

export const buildTopic = (topicSlug: string) => {
  const topicDir = locateTopicDir(process.cwd(), topicSlug);
  // @ts-ignore
  const parser = new BoomboxParser({ topicDir, topicSlug });
  publishTopicAssets(parser.topic.uri, parser.topicDir + "/images");
  const topicJson = parser.topic.packageForApi();
  copyToClipboard(JSON.stringify(topicJson));
  console.log("Topic contents copied to clipboard.");
};

function locateTopicDir(commandDir: string, topicSlug: string) {
  const splitPath = commandDir.split("/");

  // If the topic slug is not in the path, check whether the command was run from the topic's parent directory
  if (!splitPath.includes(topicSlug)) {
    if (
      fs.existsSync(commandDir + "/" + topicSlug + "/" + TOPIC_CONFIG_FILENAME)
    ) {
      return commandDir + "/" + topicSlug;
      // Otherwise, display an error and exit
      // TODO: Is this the correct approach? Should I actually throw an error instead?
      // It's less cluttered for the user to print than to actually throw.
    } else {
      console.log(
        `ERROR: Cannot find topic directory for slug ${topicSlug}. Please only run 'b5x publish ${topicSlug}' from within the topic's directory or its parent directory.`
      );
      process.exit();
    }
  }

  // If the topic slug is in the path, trim the path to the topic directory
  const slugIndex = splitPath.indexOf(topicSlug);
  return splitPath.slice(0, slugIndex + 1).join("/");
}
