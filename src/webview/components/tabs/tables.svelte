<script lang="ts">
  import { getTableMetadata, type TableMetadata } from "../../../queries";
  import Button from "../ui/button.svelte";

  let {
    selectedTable,
  }: {
    selectedTable?: string,
  } = $props();

  const columns = ['Details', 'Name', 'Data type'];

  let tableMetadata = $state<TableMetadata | undefined>(undefined);

  const fetchTableMetadata = async (reload = false) => {
    if (!selectedTable) return;
    tableMetadata = await getTableMetadata(selectedTable, reload);
  };

  $effect(() => {
    if (selectedTable) fetchTableMetadata();
  });

</script>

{#if selectedTable && tableMetadata}
  <div class="flex items-center justify-between mt-4">
    <p class="font-bold text-lg">Table {selectedTable}</p>
    <Button onclick={() => fetchTableMetadata(true)} size='icon' title="Refresh table schema from disk">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw-icon lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
    </Button>
  </div>

  <div class="overflow-x-auto mt-1.5 rounded-lg p-3 bg-gray-100 dark:bg-gray-600">
    <table class="w-full">
      <thead>
        <tr>
          {#each columns as column, i}
            <th
              scope="col"
              class="{i === 0 ? 'w-8' : 'min-w-40 max-w-96'} text-left px-3 py-1.5 rounded-lg cursor-pointer"
            >
              {column}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each tableMetadata.columns as column}
          <tr class="border-t border-t-gray-400/50">
            <td class="px-3 py-1.5 flex items-center justify-center gap-1">
              {#if column.isPrimaryKey}
                <span title="Primary key">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-key-round-icon lucide-key-round" ><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>
                </span>
              {/if}
              {#if !column.notNull}
                <span title="Nullable">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-slash2-icon lucide-circle-slash-2"><circle cx="12" cy="12" r="10"/><path d="M22 2 2 22"/></svg>
                </span>
              {/if}
            </td>
            <td class="px-3 py-1.5">
              {column.name}
            </td>
            <td class="px-3 py-1.5">
              {column.type}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}