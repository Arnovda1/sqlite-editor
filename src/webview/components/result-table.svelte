<script lang="ts">
  import type { QueryResult } from "../../types";
  import { pascalToSentence } from "../../util";
  import ResultTablePagination from "./result-table-pagination.svelte";

  let {
    title,
    data,
    loading = false,
  }: {
    title: string,
    data?: QueryResult,
    loading?: boolean,
  } = $props();

  const PAGE_SIZE = 1000;

  let selectedIndex = $state<number | undefined>(undefined);
  let page = $state(0);

  let rows = $derived(data && !('error' in data) ? data.rows : []);
  let pageCount = $derived(Math.ceil(rows.length / PAGE_SIZE));
  let pageRows = $derived(rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE));

  $effect(() => {
    // reset when data changes
    rows;
    page = 0;
    selectedIndex = undefined;
  });
</script>

{#if loading}
  <p class="font-bold text-lg mt-4">{title}</p>
  <div class="mt-1.5 rounded-lg p-6 bg-gray-300 dark:bg-gray-600 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
    <div class="animate-spin">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    </div>
    Loading
  </div>
{:else if data?.columns && data.rows}

  <div class="flex items-baseline justify-between mt-4">
    <p class="font-bold text-lg">{title}</p>
    <span class="text-xs text-gray-500 dark:text-gray-400">{rows.length} rows</span>
  </div>

  <ResultTablePagination
    {pageCount}
    bind:page={page}
    bind:selectedIndex={selectedIndex}
  />

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
        {#each pageRows as record, i}
          <tr
            class="{selectedIndex !== i - 1 ? 'border-t border-t-gray-500/70' : ''} hover:bg-gray-400 dark:hover:bg-gray-500 cursor-pointer select-none"
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
              <td colspan={data.columns.length} class="px-3 py-1.5 ring-2 ring-gray-400/60 dark:ring-gray-500/60 rounded-lg bg-gray-200 dark:bg-gray-700">
                <div class="flex flex-col">
                  {#each data.columns as column, j}
                    <div class="flex gap-4 py-1.5 {j > 0 ? 'border-t border-gray-400/60 dark:border-gray-500/60' : ''}">
                      <span class="shrink-0 w-40 text-sm font-semibold truncate pt-0.5">
                        {column}
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

  <ResultTablePagination
    {pageCount}
    bind:page={page}
    bind:selectedIndex={selectedIndex}
  />

{/if}
