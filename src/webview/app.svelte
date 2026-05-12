<script lang="ts">
  import Tabs from './components/ui/tabs.svelte';
  import Query from './components/tabs/query.svelte';
  import type { AppTabs, QueryResult, TableTypes } from '../types';
  import Overview from './components/tabs/overview.svelte';
  import Tables from './components/tabs/tables.svelte';
  import { pendingQueries, query } from '../queries';

  let currentTab = $state<AppTabs>('overview');
  // let pendingQueries = new Map<number, (result: any) => void>();
  // let queryId = 0;

  // const query = async (sql: string): Promise<QueryResult> => {
  //   return new Promise((resolve) => {
  //     const id = queryId++;
  //     pendingQueries.set(id, resolve);
  //     vscode.postMessage({ type: 'query', id, sql });
  //   });
  // }

  window.addEventListener('message', (event) => {
    const msg = event.data;
    if (msg.type === 'queryResult') {
      const resolve = pendingQueries.get(msg.id);
      if (!resolve) return;
      pendingQueries.delete(msg.id);
      if (msg.error) {
        resolve({ error: msg.error, columns: [], rows: [] });
      } else {
        const stmt = msg.results?.[0];
        resolve(stmt ? { columns: stmt.columns, rows: stmt.values } : { columns: [], rows: [] });
      }
    }
  });

  let tables: string[] = $state([]);
  let schema = $state<Record<string, string[]>>({});
  let activeTable: string | null = $state(null);
  let tableResult: QueryResult | null = $state(null);
  let sql = $state('');
  let customResult: QueryResult | null = $state(null);
  let loading = $state(true);

  // Load schema on mount
  (async () => {
    const result = await query(`
      SELECT m.name as tableName, p.name as columnName
      FROM sqlite_master m
      JOIN pragma_table_info(m.name) p
      WHERE m.type IN ('table', 'view')
      ORDER BY m.name, p.cid
    `);
    if (result && !('error' in result)) {
      const newSchema: Record<string, string[]> = {};
      result.rows.forEach(([tableName, columnName]) => {
        if (!newSchema[tableName]) newSchema[tableName] = [];
        newSchema[tableName].push(columnName);
      });
      schema = newSchema;
      tables = Object.keys(schema);
      if (tables.length > 0) selectTable(tables[0]);
    } else {
      // Fallback if pragma_table_info is not available as a function
      const tablesResult = await query(`SELECT name FROM sqlite_master WHERE type IN ('table', 'view') ORDER BY name`);
      if (tablesResult && !('error' in tablesResult)) {
        tables = tablesResult.rows.map((r) => r[0] as string);
        if (tables.length > 0) selectTable(tables[0]);
      }
    }
    loading = false;
  })();

  async function getTables(type: TableTypes = `'table', 'view'`): Promise<string[]> {
    const result = await query(`SELECT name FROM sqlite_master WHERE type IN (${type}) ORDER BY name`);
    if (!result || 'error' in result) return [];
    return result.rows.map((r) => r[0] as string);
  }

  async function selectTable(name: string) {
    activeTable = name;
    tableResult = await query(`SELECT * FROM "${name}" LIMIT 200`);
  }

</script>

<main class="p-4 font-mono text-sm">
  
  <h1 class="text-base font-bold mb-4">
    SQLite Workbench
  </h1>

  <Tabs bind:currentTab={currentTab} />

  {#if currentTab === 'query'}
    <Query {schema} />
  {:else if currentTab === 'overview'}
    <Overview />
  {:else if currentTab === 'tables'}
    <Tables />
  {/if}

  {#if loading}
    <p class="text-gray-500">Loading...</p>
  {:else}
    <!-- Table list -->
    <!-- <div class="flex gap-2 flex-wrap mb-4">
      {#each tables as t}
        <button
          class="px-2 py-1 border rounded {activeTable === t ? 'bg-blue-600 text-white' : ''}"
          onclick={() => selectTable(t)}
        >{t}</button>
      {/each}
    </div> -->

    <!-- Table data -->
    <!-- {#if tableResult}
      {#if 'error' in tableResult}
        <p class="text-red-500">{tableResult.error}</p>
      {:else}
        {@render ResultTable(tableResult.columns, tableResult.rows)}
      {/if}
    {/if} -->

    <!-- Ad-hoc query -->
    <!-- <div class="mt-6">
      <textarea
        class="w-full border p-2 rounded h-20 resize-y"
        placeholder="SELECT * FROM ..."
        bind:value={sql}
      ></textarea>
      <button class="mt-1 px-3 py-1 bg-green-600 text-white rounded" onclick={runQuery}>Run</button>
    </div> -->

    <!-- {#if customResult}
      <div class="mt-4">
        {#if 'error' in customResult}
          <p class="text-red-500">{customResult.error}</p>
        {:else}
          {@render ResultTable(customResult.columns, customResult.rows)}
        {/if}
      </div>
    {/if} -->
  {/if}
</main>

<!-- inline component -->
<!-- {#snippet ResultTable(columns: string[], rows: any[][])}
  {#if columns.length === 0}
    <p class="text-gray-500">No results.</p>
  {:else}
    <div class="overflow-x-auto">
      <table class="border-collapse text-xs">
        <thead>
          <tr>
            {#each columns as col}
              <th class="border px-2 py-1 bg-gray-100 text-left">{col}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each rows as row}
            <tr>
              {#each row as cell}
                <td class="border px-2 py-1">{cell}</td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
{/snippet} -->
