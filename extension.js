// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const provider = require('./envvarProvider');

const envvarProvider = require('./envvarProvider');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('"env-autocomplete" is active!');

	const providerDisposable = vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'javascript'}, envvarProvider, '.');

	context.subscriptions.push(providerDisposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
