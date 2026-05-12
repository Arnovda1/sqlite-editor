<script lang="ts">
  import type { QueryResult } from '../../types';
  import Button from './button.svelte';
  import Error from './error.svelte';
  import ResultTable from './result-table.svelte';

  let {
    query,
  }: {
    query: (sql: string) => Promise<QueryResult>,
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

{#if result}
  <ResultTable data={result} />
{/if}