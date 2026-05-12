<script lang="ts">
  import type { QueryResult } from "../../types";
  import { pascalToSentence } from "../../util";

  let {
    class: className = '',
    data,
  }: {
    class?: string,
    data: QueryResult,
  } = $props();

  let selectedRecord = $state<any | undefined>(undefined);

</script>

{#if data?.columns && data.rows}
  <div class="overflow-x-auto rounded-lg p-3 bg-gray-300 dark:bg-gray-600 {className}">
    <table class="w-full">
      <thead>
        <tr>
          {#each data.columns as column}
            <th scope="col" class="min-w-32 max-w-96 overflow-hidden truncate px-3 py-1.5">
              {pascalToSentence(column)}
            </th>
          {/each}
        </tr>
      </thead>

      <tbody>
        {#each data.rows as record}
          <tr
            class="border-t border-t-gray-500/70 hover:bg-gray-400 dark:hover:bg-gray-500 cursor-pointer select-none"
            onclick={() => selectedRecord = record}
          >
            {#each record as cell}
              <td class="min-w-32 max-w-96 overflow-hidden truncate px-3 py-1.5">
                {cell}
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

{#if selectedRecord}
  <div class="mt-4 p-3 rounded-lg bg-gray-300 dark:bg-gray-600 overflow-hidden">
    {#each data?.columns as column, i}
      <div class="flex gap-4 px-3 py-1.5 {i > 0 ? 'border-t border-gray-400/60 dark:border-gray-500/60' : ''}">
        <span class="shrink-0 w-40 text-sm font-semibold truncate pt-0.5">
          {pascalToSentence(column)}
        </span>
        {#if selectedRecord[i] == null}
          <span class="italic">null</span>
        {:else}
          <span class="break-all">{selectedRecord[i]}</span>
        {/if}
      </div>
    {/each}
  </div>
{/if}