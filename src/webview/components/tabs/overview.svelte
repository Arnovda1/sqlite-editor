<script lang="ts">
  import type { QueryResult } from "../../../types";
  import ResultTable from "../ui/result-table.svelte";
  import Error from '../ui/error.svelte';
  import TableSelector from "../ui/table-selector.svelte";
  import { query } from "../../../queries";

  let {
  }: {
  } = $props();

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

  $effect(() => {
    if (selectedTable) {
      handleQueryTable(selectedTable);
    }
  });

</script>

<TableSelector bind:selectedTable={selectedTable} />

<Error {error} />

{#if result || loading}
  <ResultTable
    {loading} {query}
    data={result}
    title='Table {selectedTable}'
    tableName={selectedTable}
  />
{/if}
