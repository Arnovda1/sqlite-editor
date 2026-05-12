# SQLite Workbench

A VS Code extension for viewing and querying SQLite databases.

## Features

- **Browse tables** — view all tables and views in your database, filtered by type (All / Tables / Views)
- **Query editor** — write and run SQL queries with syntax highlighting and autocomplete powered by CodeMirror 6
- **Paginated results** — large result sets are paginated (200 rows per page) for fast rendering
- **Inline record detail** — click any row to expand its full field values inline beneath it
- **Light & dark theme** — the query editor automatically follows your VS Code theme

## Images

![Tables Preview](media/screen_tables.png)
![Query Preview](media/screen_query.png)

## Limits

- Supports `.db`, `.sqlite`, and `.sqlite3` files
- The database is opened read-only, write queries (INSERT, UPDATE, DELETE) are not fully supported, there is some inline editing

## Release Notes

### 0.0.1

Initial release.
