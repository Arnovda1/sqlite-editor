import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.window.registerCustomEditorProvider(
			'sqlite-editor.dbEditor',
			new YourEditorProvider(),
		)
	);
}

class YourEditorProvider implements vscode.CustomReadonlyEditorProvider {
	openCustomDocument(uri: vscode.Uri) { return { uri, dispose() {} }; }
	resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel) {
		webviewPanel.webview.options = { enableScripts: true };
		// read file bytes: fs.readFileSync(document.uri.fsPath)
		// pass to sql.js, query tables, render HTML
		webviewPanel.webview.html = '...your HTML...';
	}
}

export function deactivate() {}