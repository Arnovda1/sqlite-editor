import * as vscode from 'vscode';
import * as fs from 'fs';
import setupDb from './setup-db';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.window.registerCustomEditorProvider(
			'sqlite-workbench.dbEditor',
			new YourEditorProvider(context),
		)
	);
}

class YourEditorProvider implements vscode.CustomReadonlyEditorProvider {
	constructor(private readonly context: vscode.ExtensionContext) {}

	openCustomDocument(uri: vscode.Uri) { return { uri, dispose() {} }; }

	async resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel) {
		webviewPanel.webview.options = { enableScripts: true };

		const db = await setupDb(document);

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
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src ${webviewPanel.webview.cspSource}; style-src ${webviewPanel.webview.cspSource} 'unsafe-inline';">
	<link rel="stylesheet" href="${styleUri}">
</head>
<body>
	<script src="${scriptUri}"></script>
</body>
</html>`;

		webviewPanel.webview.onDidReceiveMessage(async (msg) => {
			if (msg.type === 'query') {
				try {
					const isWrite = /^\s*(insert|update|delete|create|drop|alter|replace)\s/i.test(msg.sql);
					const stmt = db.prepare(msg.sql);
					const columns = stmt.getColumnNames();
					const rows: any[][] = [];
					while (stmt.step()) rows.push(stmt.get());
					stmt.free();
					if (isWrite) {
						const data = db.export();
						await fs.promises.writeFile(document.uri.fsPath, data);
					}
					const results = columns.length ? [{ columns, values: rows }] : [];
					webviewPanel.webview.postMessage({ type: 'queryResult', id: msg.id, results });
				} catch (err: any) {
					webviewPanel.webview.postMessage({ type: 'queryResult', id: msg.id, error: err.message });
				}
			}
		});
		
	}
}

export function deactivate() {}
