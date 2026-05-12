<script lang="ts">
  import type { QueryResult } from "../../types";
  import { pascalToSentence } from "../../util";

  let {
    title,
    data,
  }: {
    title: string,
    data: QueryResult,
  } = $props();

  let selectedIndex = $state<number | undefined>(undefined);

</script>

{#if data?.columns && data.rows}

  <p class="font-bold text-lg mt-4">
    {title}
  </p>

  <div class="overflow-x-auto mt-1.5 rounded-lg p-3 bg-gray-300 dark:bg-gray-600">
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
        {#each data.rows as record, i}
          <tr
            class="border-t border-t-gray-500/70 hover:bg-gray-400 dark:hover:bg-gray-500 cursor-pointer select-none"
            onclick={() => selectedIndex = selectedIndex === i ? undefined : i}
          >
            {#each record as cell}
              <td class="min-w-32 max-w-96 overflow-hidden truncate px-3 py-1.5">
                {cell}
              </td>
            {/each}
          </tr>

          {#if selectedIndex === i}
            <tr>
              <td colspan={data.columns.length} class="px-3 py-2 ring-1 ring-gray-400/60 dark:ring-gray-500/60 rounded-lg">
                <div class="flex flex-col">
                  {#each data.columns as column, j}
                    <div class="flex gap-4 py-1.5 {j > 0 ? 'border-t border-gray-400/60 dark:border-gray-500/60' : ''}">
                      <span class="shrink-0 w-40 text-sm font-semibold truncate pt-0.5">
                        {pascalToSentence(column)}
                      </span>
                      {#if record[j] == null}
                        <span class="italic text-gray-400">null</span>
                      {:else}
                        <span class="break-all">{record[j]}</span>
                      {/if}
                    </div>
                  {/each}
                </div>
              </td>
            </tr>
          {/if}
        {:else}
          <tr>
            <td colspan={data.columns.length} class="px-3 py-4 text-center text-gray-500 dark:text-gray-400 italic">
              No results found
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

{/if}
