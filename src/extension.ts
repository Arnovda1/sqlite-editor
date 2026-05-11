import initSqlJs from 'sql.js';
import * as vscode from 'vscode';
import * as fs from 'fs';
import setupDb from './setup-db';

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
	async resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel) {
		webviewPanel.webview.options = { enableScripts: true };

		try {
			await setupDb(document);
			const fileUri = document.uri.fsPath;
			const fileBytes = await fs.promises.readFile(fileUri);
			const SQL = await initSqlJs();
			const db = new SQL.Database(fileBytes);

			const statement = db.prepare("SELECT * FROM user");

			const result = statement.getAsObject({ ':aval': 1, ':bval': 'world' });

			webviewPanel.webview.html = JSON.stringify(result);

		} catch (err: any) {
			webviewPanel.webview.html = err.message || 'Failed to open db';
			vscode.window.showErrorMessage('Failed to open db', err.message)
		}

		// webviewPanel.webview.html = '...your HTML...!';
	}
}

export function deactivate() {}