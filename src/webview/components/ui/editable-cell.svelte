<script lang="ts">
  import { query } from "../../../queries";

  let {
    closeEditor,
    error = $bindable(),
    initialContent,
    tableName,
    column,
    allColumns,
    originalRow,
  }: {
    closeEditor: () => void,
    error?: string,
    initialContent?: string,
    tableName?: string,
    column?: string,
    allColumns?: string[],
    originalRow?: any[],
  } = $props();

  // svelte-ignore state_referenced_locally
  let cellInput = $state<string | undefined>(initialContent);
  let saving = $state(false);
  let handled = false;

  function sqlVal(original: any, edited: string): string {
    if (edited === '') return 'NULL';
    if (typeof original === 'number' && !isNaN(Number(edited))) return edited;
    return `'${edited.replace(/'/g, "''")}'`;
  }

  const handleSave = async () => {
    if (handled) return;
    handled = true;
    if (!tableName || !column || !allColumns || !originalRow) {
      closeEditor();
      return;
    }

    saving = true;
    error = undefined;

    const colIndex = allColumns.indexOf(column);
    const set = `"${column}" = ${sqlVal(originalRow[colIndex], cellInput ?? '')}`;
    const where = allColumns.map((col, j) =>
      originalRow[j] == null
        ? `"${col}" IS NULL`
        : `"${col}" = ${sqlVal(originalRow[j], String(originalRow[j]))}`
    ).join(' AND ');

    const result = await query(`UPDATE "${tableName}" SET ${set} WHERE ${where}`);
    if (result && 'error' in result) {
      error = result.error;
      saving = false;
      handled = false;
    } else {
      originalRow[colIndex] = cellInput === '' ? null : cellInput;
      closeEditor();
    }
  };
</script>


<!-- svelte-ignore a11y_autofocus -->
<input
  autofocus
  class="w-full bg-gray-400/60 dark:bg-gray-500/60"
  bind:value={cellInput}
  onblur={handleSave}
  onkeydown={(e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
    if (e.key === 'Escape') { e.preventDefault(); handled = true; cellInput = initialContent; closeEditor(); }
  }}
/>
<!-- {#if error}
  <span class="text-xs text-red-500">{error}</span>
{/if} -->
