export type AppTabs = 'overview' | 'query' | 'tables';

export type QueryResult = { columns: string[]; rows: any[][] } | { error: string; columns: []; rows: [] } | null;