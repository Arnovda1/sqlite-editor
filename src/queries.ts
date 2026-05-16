import type { Database } from 'sql.js';
import { QueryResult, TableTypes } from "./types";
import { vscode } from "./webview/vscode";

// --- Webview Shared Logic ---

export let pendingQueries = new Map<number, (result: any) => void>();
export let queryId = 0;

export const query = async (sql: string, reload = false): Promise<QueryResult> => {
  return new Promise((resolve) => {
    const id = queryId++;
    pendingQueries.set(id, resolve);
    vscode.postMessage({ type: 'query', id, sql, reload });
  });
};

export const getTables = async (type: TableTypes = `'table', 'view'`, reload = false): Promise<string[]> => {
  const result = await query(`SELECT name FROM sqlite_master WHERE type IN (${type}) ORDER BY name`, reload);
  if (!result || 'error' in result) return [];
  return result.rows.map((r) => r[0] as string);
};

// --- Extension Side Logic (Metadata) ---

export interface ColumnMetadata {
  name: string;
  type: string;
  notNull: boolean;
  defaultValue: any;
  isPrimaryKey: boolean;
}

export interface ForeignKeyMetadata {
  column: string;
  referencedTable: string;
  referencedColumn: string;
  onUpdate: string;
  onDelete: string;
}

export interface TableMetadata {
  name: string;
  columns: ColumnMetadata[];
  foreignKeys: ForeignKeyMetadata[];
}

export async function getTableMetadata(tableName: string, reload = false): Promise<TableMetadata> {
  const columnsResult = await query(`PRAGMA table_info("${tableName}")`, reload);
  const columns: ColumnMetadata[] = [];
  
  if (columnsResult && !('error' in columnsResult)) {
    for (const row of columnsResult.rows) {
      columns.push({
        name: row[1] as string,
        type: row[2] as string,
        notNull: row[3] === 1,
        defaultValue: row[4],
        isPrimaryKey: row[5] === 1
      });
    }
  }

  const fkResult = await query(`PRAGMA foreign_key_list("${tableName}")`);
  const foreignKeys: ForeignKeyMetadata[] = [];

  if (fkResult && !('error' in fkResult)) {
    for (const row of fkResult.rows) {
      foreignKeys.push({
        column: row[3] as string,
        referencedTable: row[2] as string,
        referencedColumn: row[4] as string,
        onUpdate: row[5] as string,
        onDelete: row[6] as string
      });
    }
  }

  return {
    name: tableName,
    columns,
    foreignKeys
  };
}
