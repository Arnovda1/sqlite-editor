<script lang="ts">
  import type { QueryResult } from "../../../types";
  import ResultTable from "../ui/result-table.svelte";
  import Error from '../ui/error.svelte';
  import { query } from "../../../queries";

  let {
    selectedTable,
  }: {
    selectedTable?: string,
  } = $props();

  let cache = $state<Record<string, QueryResult>>({});
  let error = $state<string | undefined>(undefined);
  let loading = $state(false);

  let result = $derived(selectedTable ? cache[selectedTable] : undefined);

  const handleQueryTable = async (table: string) => {
    if (cache[table]) return;
    error = undefined;
    loading = true;
    try {
      const res = await query(`SELECT * FROM "${table}"`);
      if (res && 'error' in res) {
        error = res.error;
      } else {
        cache[table] = res;
      }
    } catch (err: any) {
      error = typeof err === 'string' ? err : err.message;
    } finally {
      loading = false;
    }
  }

  const refreshTable = async (table: string) => {
    error = undefined;
    loading = true;
    try {
      const res = await query(`SELECT * FROM "${table}"`);
      if (res && 'error' in res) {
        error = res.error;
      } else {
        cache[table] = res;
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

<Error {error} />

{#if result || loading}
  <ResultTable
    {loading}
    data={result}
    title='Table {selectedTable}'
    tableName={selectedTable}
    onRefresh={() => selectedTable && refreshTable(selectedTable)}
  />
{/if}
