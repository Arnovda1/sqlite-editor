<script lang="ts">
  import { tick } from 'svelte';
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
  let savedResult = $state(saved.result ?? undefined);

  $effect(() => {
    vscode.setState({ tab: currentTab, table: selectedTable, sql: savedSql, result: savedResult });
  });

  const scrollPositions: Partial<Record<AppTabs, number>> = {};

  $effect(() => {
    const tab = currentTab;
    return () => {
      scrollPositions[tab] = window.scrollY;
    };
  });

  $effect(() => {
    const pos = scrollPositions[currentTab] ?? 0;
    tick().then(() => window.scrollTo({ top: pos, behavior: 'instant' }));
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

  <div class={currentTab === 'query' ? 'hidden' : ''}>
    <TableSelector bind:selectedTable={selectedTable} />
  </div>

  <div class={currentTab !== 'query' ? 'hidden' : ''}>
    <Query
      initialSql={savedSql}
      initialResult={savedResult}
      onSqlChange={(sql) => savedSql = sql}
      onResultChange={(r) => savedResult = r}
    />
  </div>
  <div class={currentTab !== 'overview' ? 'hidden' : ''}>
    <Overview {selectedTable} />
  </div>
  <div class={currentTab !== 'tables' ? 'hidden' : ''}>
    <Tables {selectedTable} />
  </div>

</main>
