import initSqlJs, { type Database } from 'sql.js';
import * as vscode from 'vscode';
import * as fs from 'fs';

const setupDb = async (document: vscode.CustomDocument): Promise<Database> => {
  try {
    const fileUri = document.uri.fsPath;
    const fileBytes = await fs.promises.readFile(fileUri);
    const SQL = await initSqlJs();
    const db = new SQL.Database(fileBytes);
    
    return db;

  } catch (err: any) {
    vscode.window.showErrorMessage(err?.message || 'Failed to load db');
    throw new Error('Failed to load db');
  }
};

export default setupDb;