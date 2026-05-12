<script lang="ts">
  import { onMount } from "svelte";
  import type { QueryResult, TableTypes } from "../../types";
  import ResultTable from "./result-table.svelte";
  import Error from './error.svelte';
  import Button from "./button.svelte";

  let {
    getTables,
    query,
  }: {
    getTables: (type?: TableTypes) => Promise<string[]>
    query: (sql: string) => Promise<QueryResult>,
  } = $props();

  const typeOptions: { label: string; value: TableTypes }[] = [
    { label: 'All',    value: `'table', 'view'` },
    { label: 'Tables', value: `'table'` },
    { label: 'Views',  value: `'view'` },
  ];

  let selectedType = $state<TableTypes>(`'table', 'view'`);
  let tables = $state<string[]>([]);
  let selectedTable = $state<string | undefined>(undefined);
  let result = $state<QueryResult | undefined>(undefined);
  let error = $state<string | undefined>(undefined);
  let loading = $state(false);

  async function loadTables(type: TableTypes) {
    selectedType = type;
    tables = await getTables(type);
    result = undefined;
    selectedTable = undefined;
  }

  const handleQueryTable = async (table: string) => {
    error = undefined;
    loading = true;
    selectedTable = table;
    try {
      result = await query(`SELECT * FROM ${table}`);
    } catch (err: any) {
      error = typeof err === 'string' ? err : err.message;
    } finally {
      loading = false;
    }
  }

  onMount(() => loadTables(selectedType));
</script>

<div class="flex w-fit gap-1.5 my-1.5">
  {#each typeOptions as option}
    <Button class="mx-0 mt-0" isActive={selectedType === option.value} onclick={() => loadTables(option.value)}>
      {option.label}
    </Button>
  {/each}
</div>

<div class="grid gap-1.5 mt-1.5" style="grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr))">
  {#each tables as table}
    <Button class="w-full mx-0 mt-0 truncate" isActive={selectedTable === table} onclick={() => handleQueryTable(table)}>
      {table}
    </Button>
  {/each}
</div>

<Error {error} />

{#if result || loading}
  <ResultTable data={result} title='Table {selectedTable}' {loading} />
{/if}
