<script lang="ts">
  import { onMount } from "svelte";
  import type { QueryResult } from "../../types";
  import ResultTable from "./result-table.svelte";
  import Error from './error.svelte';
    import Button from "./button.svelte";

  let {
    getTables,
    query,
  }: {
    getTables: () => Promise<string[]>
    query: (sql: string) => Promise<QueryResult>,
  } = $props();

  let tables = $state<string[]>([]);
  let selectedTable = $state<string | undefined>(undefined);

  let result = $state<QueryResult | undefined>(undefined);
  let error = $state<string | undefined>(undefined);

  const handleQueryTable = async (table: string) => {
    error = undefined;
    selectedTable = table;

    try {
      result = await query(`SELECT * FROM ${table}`);
    } catch (err: any) {
      error = typeof err === 'string' ? err : err.message;
    }
  }

  onMount(async () => {
    tables = await getTables();
  });

</script>

<div class="grid gap-1.5 mt-1.5" style="grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr))">
  {#each tables as table}
    <Button class="w-full mx-0 mt-0 truncate" onclick={() => handleQueryTable(table)}>
      {table}
    </Button>
  {/each}
</div>

<Error {error} />

{#if result}
  <ResultTable data={result} title='Table {selectedTable}' />
{/if}