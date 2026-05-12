<script lang="ts">
  import type { QueryResult, TableTypes } from "../../types";
  import ResultTable from "./result-table.svelte";
  import Error from './error.svelte';
  import TableSelector from "./table-selector.svelte";

  let {
    getTables,
    query,
  }: {
    getTables: (type?: TableTypes) => Promise<string[]>
    query: (sql: string) => Promise<QueryResult>,
  } = $props();

  let selectedType = $state<TableTypes>(`'table', 'view'`);
  let tables = $state<string[]>([]);
  let selectedTable = $state<string | undefined>(undefined);
  let result = $state<QueryResult | undefined>(undefined);
  let error = $state<string | undefined>(undefined);
  let loading = $state(false);

  const handleQueryTable = async (table: string) => {
    error = undefined;
    result = undefined;
    loading = true;
    selectedTable = table;
    try {
      const res = await query(`SELECT * FROM "${table}"`);
      if (res && 'error' in res) {
        error = res.error;
      } else {
        result = res;
      }
    } catch (err: any) {
      error = typeof err === 'string' ? err : err.message;
    } finally {
      loading = false;
    }
  }

</script>

<TableSelector
  bind:selectedTable={selectedTable}
/>

<Error {error} />

{#if result || loading}
  <ResultTable
    {loading} {query}
    data={result}
    title='Table {selectedTable}'
    tableName={selectedTable}
  />
{/if}
