import type { Database } from 'sql.js';
import { QueryResult, TableTypes } from "./types";
import { vscode } from "./webview/vscode";

// --- Webview Shared Logic ---

export let pendingQueries = new Map<number, (result: any) => void>();
export let queryId = 0;

export const query = async (sql: string): Promise<QueryResult> => {
  return new Promise((resolve) => {
    const id = queryId++;
    pendingQueries.set(id, resolve);
    vscode.postMessage({ type: 'query', id, sql });
  });
};

export const getTables = async (type: TableTypes = `'table', 'view'`): Promise<string[]> => {
  const result = await query(`SELECT name FROM sqlite_master WHERE type IN (${type}) ORDER BY name`);
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

/**
 * Retrieves detailed metadata for a specific table, including columns, 
 * primary keys, and foreign key relationships.
 * 
 * NOTE: This function is intended to be called from the extension side where 
 * the 'sql.js' Database object is available.
 */
export function getTableMetadata(db: Database, tableName: string): TableMetadata {
  // 1. Get column information and primary keys
  const columnsResult = db.exec(`PRAGMA table_info("${tableName}")`);
  const columns: ColumnMetadata[] = [];
  
  if (columnsResult.length > 0) {
    const { values } = columnsResult[0];
    for (const row of values) {
      columns.push({
        name: row[1] as string,
        type: row[2] as string,
        notNull: row[3] === 1,
        defaultValue: row[4],
        isPrimaryKey: row[5] === 1
      });
    }
  }

  // 2. Get foreign key relationships
  const fkResult = db.exec(`PRAGMA foreign_key_list("${tableName}")`);
  const foreignKeys: ForeignKeyMetadata[] = [];

  if (fkResult.length > 0) {
    const { values } = fkResult[0];
    for (const row of values) {
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
