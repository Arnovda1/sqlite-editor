<script lang="ts">
  import Tabs from './components/ui/tabs.svelte';
  import Query from './components/tabs/query.svelte';
  import type { AppTabs } from '../types';
  import Overview from './components/tabs/overview.svelte';
  import Tables from './components/tabs/tables.svelte';
  import { pendingQueries } from '../queries';
  import TableSelector from './components/ui/table-selector.svelte';
  import { vscode } from './vscode';

  const saved = vscode.getState() ?? {};

  let currentTab = $state<AppTabs>(saved.tab ?? 'overview');
  let selectedTable = $state<string | undefined>(saved.table ?? undefined);
  let savedSql = $state<string>(saved.sql ?? '');

  $effect(() => {
    vscode.setState({ tab: currentTab, table: selectedTable, sql: savedSql });
  });

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
</script>

<main class="p-4 font-mono text-sm">

  <h1 class="text-base font-bold mb-4">
    SQLite Workbench
  </h1>

  <Tabs bind:currentTab={currentTab} />

  {#if currentTab !== 'query'}
    <TableSelector bind:selectedTable={selectedTable} />
  {/if}

  {#if currentTab === 'query'}
    <Query initialSql={savedSql} onSqlChange={(sql) => savedSql = sql} />
  {:else if currentTab === 'overview'}
    <Overview {selectedTable} />
  {:else if currentTab === 'tables'}
    <Tables {selectedTable} />
  {/if}

</main>
