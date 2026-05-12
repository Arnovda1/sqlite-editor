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

<div class="flex flex-wrap">
  {#each tables as table}
    <Button onclick={() => handleQueryTable(table)}>
      {table}
    </Button>
  {/each}
</div>

<Error {error} />

{#if result}
  <ResultTable data={result} title='Table {selectedTable}' />
{/if}