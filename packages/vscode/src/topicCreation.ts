import * as vscode from 'vscode';
import { NewTopicConfig } from '@b5x/types';
import { spinalcase } from "stringcase";
import * as YAML from "yaml";
import * as fs from "fs";

export function buildTopicConfig(): NewTopicConfig {
  /*
  vscode.window.showInputBox({prompt: "Enter a topic identifier to use in the topic's URL (e.g., my-new-topic):"}).then((value) => {
    vscode.window.showInformationMessage(`Entered value: ${value}`);
  });
  */
	return {
    title: 'My New Topic',
    slug: 'my-new-topic',
    subtitle: 'My new topic subtitle',
    groupAccessLevels: {
      assigned: ['all'],
    },
    // TODO: This should be cover-image in the yaml file,
    // it should not become coverImageUrl until it hits the server,
    // but the types are not set up quite correctly and the CLI
    // still depends on them as well, so just leaving it for the moment.
    coverImageUrl: '',
  }
}

export function createTopicFolder(topicParentDir: string, topicConfig: NewTopicConfig) {
	console.log('createTopicFolder');
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