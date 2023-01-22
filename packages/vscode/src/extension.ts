// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';

// run this function again after new topics are created
function findTopicFolders() {
	console.log('findTopicFolders');
	if (!vscode.workspace.workspaceFolders) {
		return;
	}
	const rootFolderUri = vscode.workspace.workspaceFolders[0].uri;
	// find all topic folders
	// add them to the list of topic folders that can be built
}

function buildTopicConfig() {
	// query the user for the topic parameters
	// return a topic config object
	console.log('buildTopicConfig');
}

function createTopicFolder() {
	// create a new topic folder that includes an images directory etc.
	// add the topic folder to the list of topic folders that can be built
	console.log('createTopicFolder');
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('activated');
	findTopicFolders();

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	let createNewTopic = vscode.commands.registerCommand('b5x.createNewTopic', ({ fsPath }) => {
		/*
		vscode.window.showInputBox({prompt: "Enter a topic identifier to use in the topic's URL (e.g., my-new-topic):"}).then((value) => {
			vscode.window.showInformationMessage(`Entered value: ${value}`);
		});
		*/
		// console.log(fs.readdirSync(fsPath));
		buildTopicConfig();
		createTopicFolder();
		findTopicFolders();
		vscode.window.showInformationMessage('Topic folder created.');
	});

	let buildTopic = vscode.commands.registerCommand('b5x.buildTopicData', () => {
		vscode.window.showInformationMessage('Build Topic Data');
	});

	context.subscriptions.push(createNewTopic);
	context.subscriptions.push(buildTopic);
}

// This method is called when your extension is deactivated
export function deactivate() {}
