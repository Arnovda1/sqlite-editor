<script lang="ts">
  import Error from './error.svelte';

  let {
    query,
  }: {
    query: (sql: string) => Promise<{ columns: string[]; rows: any[][] } | null>,
  } = $props();

  let statement = $state("SELECT * FROM user");
  let error = $state<undefined | string>(undefined);

  const handleQuery = async () => {
    try {
      const result = await query(statement);
      if (!result) throw new TypeError('Failed to query db');

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

<button class="py-1.5 px-2.5 mt-1.5 mx-auto rounded-lg bg-gray-100 dark:bg-gray-900 text-dark dark:text-white" onclick={handleQuery}>
  QUERY
</button>