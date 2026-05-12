<script lang="ts">
  import type { QueryResult } from '../../types';
  import Button from './button.svelte';
  import Error from './error.svelte';
  import ResultTable from './result-table.svelte';

  let {
    query,
  }: {
    query: (sql: string) => Promise<{ columns: string[]; rows: any[][] } | null>,
  } = $props();

  let statement = $state("SELECT * FROM user");
  let result = $state<QueryResult | undefined>(undefined);
  let error = $state<string | undefined>(undefined);

  const handleQuery = async () => {
    try {
      result = await query(statement);
    } catch (err: any) {
      error = typeof err === 'string' ? err : err.message;
    }
  }

</script>

<textarea
  class="w-full min-h-64 rounded-lg p-3 mb-1.5 bg-gray-300 dark:bg-gray-600"
  placeholder="SELECT * FROM user"
  bind:value={statement}
></textarea>

<Error {error} />

<Button onclick={handleQuery}>
  QUERY
</Button>

<!-- <button class="py-1.5 px-2.5 mt-1.5 mx-auto rounded-lg bg-gray-100 dark:bg-gray-900 text-dark dark:text-white" onclick={handleQuery}>
  QUERY
</button> -->

{#if result}
  <ResultTable data={result} />
{/if}