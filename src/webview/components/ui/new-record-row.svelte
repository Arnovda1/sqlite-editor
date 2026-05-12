<script lang="ts">
  import { query } from "../../../queries";

  let {
    columns,
    tableName,
    onSave,
    onCancel,
  }: {
    columns: string[],
    tableName: string,
    onSave: () => void,
    onCancel: () => void,
  } = $props();

  let values = $state<string[]>(columns.map(() => ''));
  let saving = $state(false);
  let error = $state<string | undefined>(undefined);

  function sqlVal(val: string): string {
    if (val === '') return 'NULL';
    if (!isNaN(Number(val)) && val.trim() !== '') return val;
    return `'${val.replace(/'/g, "''")}'`;
  }

  const handleSave = async () => {
    saving = true;
    error = undefined;
    const cols = columns.map(c => `"${c}"`).join(', ');
    const vals = values.map(v => sqlVal(v)).join(', ');
    const result = await query(`INSERT INTO "${tableName}" (${cols}) VALUES (${vals})`);
    if (result && 'error' in result) {
      error = result.error;
      saving = false;
    } else {
      onSave();
    }
  };
</script>

<tr class="border-t border-t-gray-400/50 bg-gray-200/60 dark:bg-gray-700/60">
  {#each columns as _, j}
    <td class="min-w-40 max-w-96 px-3 py-1.5">
      <!-- svelte-ignore a11y_autofocus -->
      <input
        autofocus={j === 0}
        placeholder="null"
        class="w-full bg-transparent placeholder-gray-400 dark:placeholder-gray-500 outline-none"
        bind:value={values[j]}
        onkeydown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
          if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
        }}
      />
    </td>
  {/each}
</tr>
{#if error}
  <tr>
    <td colspan={columns.length} class="px-3 pb-2">
      <span class="text-xs text-red-500">{error}</span>
    </td>
  </tr>
{/if}
