// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	let createNewTopic = vscode.commands.registerCommand('b5x.createNewTopic', (e) => {
		vscode.window.showInputBox({prompt: "Enter a topic identifier to use in the topic's URL (e.g., my-new-topic):"}).then((value) => {
			vscode.window.showInformationMessage(`Entered value: ${value}`);
		});
		// console.log(e.fsPath);
	});

	let buildTopic = vscode.commands.registerCommand('b5x.buildTopicData', () => {
		vscode.window.showInformationMessage('Build Topic Data');
	});

	context.subscriptions.push(createNewTopic);
	context.subscriptions.push(buildTopic);
}

// This method is called when your extension is deactivated
export function deactivate() {}
