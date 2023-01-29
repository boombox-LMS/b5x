import * as vscode from "vscode";
import { NewTopicConfig } from "@b5x/types";
import { spinalcase } from "stringcase";
import * as YAML from "yaml";
import * as fs from "fs";
import { copyFolderRecursiveSync } from "./fsHelpers";

export async function buildTopicConfig(): Promise<NewTopicConfig> {
  let slug: string, title: string, subtitle: string;
  return vscode.window
    .showInputBox({
      prompt:
        "Enter a topic identifier to use in the topic's URL (example: intro-to-sql):",
    })
    .then(async (value) => {
      // TODO: Handle blanks and invalid characters
      slug = value || "no-slug-provided";

      // populate title
      await vscode.window
        .showInputBox({
          prompt: "Enter a title for the topic (example: Intro to SQL):",
        })
        .then((value) => {
          // TODO: Handle blanks and invalid characters
          title = value || "Untitled topic";
        });

      // populate subtitle
      await vscode.window
        .showInputBox({
          prompt:
            "Enter a subtitle for the topic (example: A guide for complete beginners):",
        })
        .then((value) => {
          // TODO: Handle blanks and invalid characters
          subtitle = value || "No subtitle provided";
        });

      return {
        title,
        slug,
        subtitle,
        groupAccessLevels: {
          assigned: ["all"],
        },
        // TODO: This should be cover-image in the yaml file,
        // it should not become coverImageUrl until it hits the server,
        // but the types are not set up quite correctly and the CLI
        // still depends on them as well, so just leaving it for the moment.
        coverImageUrl: "",
      };
    });
}

export function createTopicFolder(
  topicParentDir: string,
  topicConfig: NewTopicConfig
) {
  // Create the topic folder in the parent directory
  const topicFolderPath = topicParentDir + "/" + topicConfig.slug;
  fs.mkdirSync(topicFolderPath);

  // Create the topic-config.yaml file
  writeTopicConfig(topicConfig, topicFolderPath);

  // Create the images directory in the topic folder
  const imagesFolderPath = topicFolderPath + "/images";
  fs.mkdirSync(imagesFolderPath);
  fs.writeFileSync(imagesFolderPath + "/.keep", "");

  // Create the documents directory in the topic folder,
  // populated with a few example documents
  const exampleDocumentsFolderPath = __dirname + "/templates/topic/documents";
  // Copy the example documents into the documents folder
  // TODO: Need to modify the build script to copy the templates folder,
  // it's currently empty in /out so no example docs show up
  copyFolderRecursiveSync(exampleDocumentsFolderPath, topicFolderPath);
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
