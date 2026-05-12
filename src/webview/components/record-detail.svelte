<script lang="ts">
  import type { QueryResult } from "../../types";

  let {
    record,
    columns,
    tableName,
    query,
    onclose,
  }: {
    record: any[],
    columns: string[],
    tableName?: string,
    query?: (sql: string) => Promise<QueryResult>,
    onclose: () => void,
  } = $props();

  let editValues = $state<string[]>(record.map(v => v == null ? '' : String(v)));
  let saving = $state(false);
  let saveError = $state<string | undefined>(undefined);
  let saveSuccess = $state(false);

  function sqlVal(original: any, edited: string): string {
    if (edited === '') return 'NULL';
    if (typeof original === 'number' && !isNaN(Number(edited))) return edited;
    return `'${edited.replace(/'/g, "''")}'`;
  }

  async function saveRecord() {
    if (!tableName || !query) return;
    saving = true;
    saveError = undefined;
    saveSuccess = false;

    const set = columns.map((col, j) => `"${col}" = ${sqlVal(record[j], editValues[j])}`).join(', ');
    const where = columns.map((col, j) => record[j] == null ? `"${col}" IS NULL` : `"${col}" = ${sqlVal(record[j], String(record[j]))}`).join(' AND ');

    try {
      await query(`UPDATE "${tableName}" SET ${set} WHERE ${where}`);
      saveSuccess = true;
      columns.forEach((_, j) => { record[j] = editValues[j] === '' ? null : editValues[j]; });
    } catch (err: any) {
      saveError = typeof err === 'string' ? err : err.message;
    } finally {
      saving = false;
    }
  }
</script>

<tr>
  <td colspan={columns.length} class="px-3 py-2 ring-2 ring-gray-400/60 dark:ring-gray-500/60 rounded-lg bg-gray-200 dark:bg-gray-700">
    <div class="flex flex-col">
      {#each columns as column, j}
        <div class="flex gap-4 py-1.5 {j > 0 ? 'border-t border-gray-400/60 dark:border-gray-500/60' : ''}">
          <span class="shrink-0 w-40 text-sm font-semibold truncate pt-1">
            {column}
          </span>
          {#if tableName && query}
            <input
              type="text"
              bind:value={editValues[j]}
              placeholder="null"
              class="flex-1 min-w-0 rounded px-2 py-0.5 text-sm placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-1 ring-gray-400 dark:ring-gray-500"
            />
          {:else if record[j] == null}
            <span class="italic text-gray-400">null</span>
          {:else}
            <span class="break-all">{record[j]}</span>
          {/if}
        </div>
      {/each}
    </div>

    {#if tableName && query}
      <div class="flex items-center gap-2 mt-2 pt-2 border-t border-gray-400/60 dark:border-gray-500/60">
        <button
          disabled={saving}
          onclick={saveRecord}
          class="px-3 py-1 rounded-lg text-xs font-medium bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 disabled:opacity-50 active:translate-y-0.5 transition-transform"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onclick={onclose}
          class="px-3 py-1 rounded-lg text-xs bg-gray-300 dark:bg-gray-600 active:translate-y-0.5 transition-transform"
        >
          Cancel
        </button>
        {#if saveSuccess}
          <span class="text-xs text-green-600 dark:text-green-400">Saved</span>
        {/if}
        {#if saveError}
          <span class="text-xs text-red-500">{saveError}</span>
        {/if}
      </div>
    {/if}
  </td>
</tr>
