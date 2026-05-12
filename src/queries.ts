import { QueryResult, TableTypes } from "./types";
import { vscode } from "./webview/vscode";

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

