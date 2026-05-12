<script lang="ts">
  import { getTableMetadata, type TableMetadata } from "../../../queries";

  let {
    selectedTable,
  }: {
    selectedTable?: string,
  } = $props();

  const columns = ['Details', 'Name', 'Data type'];

  let tableMetadata = $state<TableMetadata | undefined>(undefined);

  const fetchTableMetadata = async () => {
    if (!selectedTable) return;
    tableMetadata = await getTableMetadata(selectedTable);
  };

  $effect(() => {
    if (selectedTable) fetchTableMetadata();
  });

</script>

{#if selectedTable && tableMetadata}
  <p class="font-bold text-lg mt-4">Table {selectedTable}</p>

  <div class="overflow-x-auto mt-1.5 rounded-lg p-3 bg-gray-100 dark:bg-gray-600">
    <table class="w-full">
      <thead>
        <tr>
          {#each columns as column, i}
            <th
              scope="col"
              class="{i === 0 ? 'w-8' : 'min-w-32 max-w-96'} text-left px-3 py-1.5 rounded-lg cursor-pointer"
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