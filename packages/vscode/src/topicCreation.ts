import * as vscode from 'vscode';

export function buildTopicConfig() {
  /*
  vscode.window.showInputBox({prompt: "Enter a topic identifier to use in the topic's URL (e.g., my-new-topic):"}).then((value) => {
    vscode.window.showInformationMessage(`Entered value: ${value}`);
  });
  */
	console.log('buildTopicConfig');
}

export function createTopicFolder(topicParentDir: string) {
	// create a new topic folder that includes an images directory etc.
	// add the topic folder to the list of topic folders that can be built
	console.log('createTopicFolder');
}