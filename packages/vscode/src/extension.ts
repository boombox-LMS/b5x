// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';

// Run this function again after new topics are created.
// Looks like this could run when the user changes workspace folders
// if we listen for the onDidChangeWorkspaceFolders event
// available on vscode.workspace

function listTopicFolders(dir: string) {
	let results: string[] = [];
	const list = fs.readdirSync(dir);
	list.forEach(function(file) {
			file = dir + '/' + file;
			const stat = fs.statSync(file);
			if (stat && stat.isDirectory()) { 
				results = results.concat(listTopicFolders(file));
			} else { 
				let fileName = file.split(/(\\|\/)/g).pop();
				if (fileName === 'topic-config.yaml') {
					results.push(dir)
				}
			}
	});
	return [...new Set(results)];
}

/**
 * Scan the workspace for topic folders,
 * and return an array of folder URIs
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

function buildTopicConfig() {
	// query the user for the topic parameters
	// return a topic config object
	console.log('buildTopicConfig');
}

function createTopicFolder(parentFolderUri: vscode.Uri) {
	// create a new topic folder that includes an images directory etc.
	// add the topic folder to the list of topic folders that can be built
	console.log('createTopicFolder');
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('activated');
	scanWorkspaceForTopicFolders();

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	let createNewTopic = vscode.commands.registerCommand('b5x.createNewTopic', (resourceUri) => {
		/*
		vscode.window.showInputBox({prompt: "Enter a topic identifier to use in the topic's URL (e.g., my-new-topic):"}).then((value) => {
			vscode.window.showInformationMessage(`Entered value: ${value}`);
		});
		*/
		console.log('resourceUri: ' + resourceUri);
		buildTopicConfig();
		createTopicFolder(resourceUri);
		scanWorkspaceForTopicFolders();
		vscode.window.showInformationMessage('Topic folder created.');
	});

	let buildTopic = vscode.commands.registerCommand('b5x.buildTopicData', (resourceUri) => {
		vscode.window.showInformationMessage('Build Topic Data');
	});

	context.subscriptions.push(createNewTopic);
	context.subscriptions.push(buildTopic);
}

// This method is called when your extension is deactivated
export function deactivate() {}
