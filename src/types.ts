export type AppTabs = 'query' | 'tables';

export type QueryResult = { columns: string[]; rows: any[][] } | { error: string; columns: []; rows: [] } | null;

export type TableTypes = `'table'` | `'view'` | `'table', 'view'`;