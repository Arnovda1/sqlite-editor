import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import * as vscode from 'vscode';
import * as fs from 'fs';

let SQL: SqlJsStatic | undefined;

const setupDb = async (document: vscode.CustomDocument): Promise<Database> => {
  try {
    const fileUri = document.uri.fsPath;
    const fileBytes = await fs.promises.readFile(fileUri);
    if (!SQL) SQL = await initSqlJs();

    const db = new SQL.Database(fileBytes);
    
    return db;

  } catch (err: any) {
    vscode.window.showErrorMessage(err?.message || 'Failed to load db');
    throw new Error('Failed to load db');
  }
};

export default setupDb;