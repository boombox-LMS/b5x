import * as vscode from 'vscode';
import { buildTopicConfig, createTopicFolder } from './topicCreation';
import { listTopicFolders } from './fsHelpers';

/**
 * Return an array of folder URIs
 * representing all of the topic folders in the workspace.
 */
function scanWorkspaceForTopicFolders() {
	if (!vscode.workspace.workspaceFolders) {
		return;
	}
	const rootFolderUri = vscode.workspace.workspaceFolders[0].uri;
	const topicFolders = listTopicFolders(rootFolderUri.fsPath);
	vscode.commands.executeCommand('setContext', 'b5x.topicFolders', topicFolders);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	scanWorkspaceForTopicFolders();

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	let createNewTopic = vscode.commands.registerCommand('b5x.createNewTopic', async (resourceUri) => {
		const topicConfig = await buildTopicConfig();
		createTopicFolder(resourceUri.fsPath, topicConfig);
		scanWorkspaceForTopicFolders();
		vscode.window.showInformationMessage('Topic folder created.');
	});

	let buildTopic = vscode.commands.registerCommand('b5x.buildTopicData', (resourceUri) => {
		vscode.window.showInformationMessage('Topic data compiled and copied to clipboard (JK).');
	});

	context.subscriptions.push(createNewTopic);
	context.subscriptions.push(buildTopic);
}

// This method is called when your extension is deactivated
export function deactivate() {}
