import * as vscode from 'vscode';
import setupDb from './setup-db';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.window.registerCustomEditorProvider(
			'sqlite-editor.dbEditor',
			new YourEditorProvider(context),
		)
	);
}

class YourEditorProvider implements vscode.CustomReadonlyEditorProvider {
	constructor(private readonly context: vscode.ExtensionContext) {}

	openCustomDocument(uri: vscode.Uri) { return { uri, dispose() {} }; }

	async resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel) {
		webviewPanel.webview.options = { enableScripts: true };

		const scriptUri = webviewPanel.webview.asWebviewUri(
			vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview.js')
		);
		const styleUri = webviewPanel.webview.asWebviewUri(
			vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview.css')
		);

		webviewPanel.webview.html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src ${webviewPanel.webview.cspSource}; style-src ${webviewPanel.webview.cspSource};">
	<link rel="stylesheet" href="${styleUri}">
</head>
<body>
	<script src="${scriptUri}"></script>
</body>
</html>`;

		webviewPanel.webview.onDidReceiveMessage((msg) => {
			if (msg.type === 'ready') {
				webviewPanel.webview.postMessage({
					type: 'load',
					tables: ['users', 'posts'],
					rows: [
						{ id: 1, name: 'Alice' },
						{ id: 2, name: 'Bob' },
					]
				});
			}
		});

		try {
			const db = await setupDb(document);
		} catch (err: any) {
			vscode.window.showErrorMessage('Failed to open db: ' + err.message);
		}
	}
}

export function deactivate() {}
