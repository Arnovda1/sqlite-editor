<script lang="ts">
  import type { QueryResult } from "../../../types";
  import { pascalToSentence } from "../../../util";
  import ResultTablePagination from "./result-table-pagination.svelte";
  import RecordDetail from "./record-detail.svelte";

  let {
    title,
    data,
    loading = false,
    tableName,
    query,
  }: {
    title: string,
    data?: QueryResult,
    loading?: boolean,
    tableName?: string,
    query?: (sql: string) => Promise<QueryResult>,
  } = $props();

  const PAGE_SIZE = 1000;

  let selectedIndex = $state<number | undefined>(undefined);
  let page = $state(0);
  let sortCol = $state<number | undefined>(undefined);
  let sortDir = $state<'asc' | 'desc'>('asc');
  let filters = $state<string[]>([]);

  let columns = $derived(data && !('error' in data) ? data.columns : []);
  let rows = $derived(data && !('error' in data) ? data.rows : []);

  let filteredRows = $derived.by(() => {
    const active = filters.map((f, i) => ({ i, f: f.trim().toLowerCase() })).filter(x => x.f);
    if (!active.length) return rows;
    return rows.filter(row =>
      active.every(({ i, f }) => String(row[i] ?? '').toLowerCase().includes(f))
    );
  });

  let sortedRows = $derived.by(() => {
    if (sortCol === undefined) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const av = a[sortCol!], bv = b[sortCol!];
      if (av === bv) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      const result = av < bv ? -1 : 1;
      return sortDir === 'asc' ? result : -result;
    });
  });

  let pageCount = $derived(Math.ceil(sortedRows.length / PAGE_SIZE));
  let pageRows = $derived(sortedRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE));

  function handleSort(i: number) {
    if (sortCol === i) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortCol = i;
      sortDir = 'asc';
    }
    page = 0;
    selectedIndex = undefined;
  }

  $effect(() => {
    rows;
    page = 0;
    selectedIndex = undefined;
    sortCol = undefined;
    sortDir = 'asc';
    filters = [];
  });
</script>

{#if loading}
  <p class="font-bold text-lg mt-4">{title}</p>

  <!-- reserved space for pagination -->
  <div class="h-8"></div>

  <div class="mt-1.5 rounded-lg p-6 bg-gray-100 dark:bg-gray-600 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
    <div class="animate-spin">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    </div>
    Loading
  </div>
{:else if data?.columns && data.rows}

  <div class="flex items-baseline justify-between mt-4">
    <p class="font-bold text-lg">{title}</p>
    <span class="text-xs text-gray-500 dark:text-gray-400">
      {sortedRows.length !== rows.length ? `${sortedRows.length} / ` : ''}{rows.length} rows
    </span>
  </div>

  <ResultTablePagination
    {pageCount}
    bind:page={page}
    bind:selectedIndex={selectedIndex}
  />

  <div class="overflow-x-auto mt-1.5 rounded-lg p-3 bg-gray-100 dark:bg-gray-600">
    <table class="w-full">
      <thead>
        <tr>
          {#each columns as column, i}
            <th
              scope="col"
              class="min-w-32 max-w-96 px-3 py-1.5 rounded-lg cursor-pointer select-none hover:bg-gray-400/40 dark:hover:bg-gray-500/40 {sortCol === i ? 'bg-gray-400/40 dark:bg-gray-500/40' : ''}"
              onclick={() => handleSort(i)}
            >
              <div class="flex items-center gap-1 overflow-hidden">
                <span class="shrink-0 opacity-50">
                  {#if sortCol === i}
                    {#if sortDir === 'asc'}
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                    {:else}
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                    {/if}
                  {/if}
                </span>
                <span class="truncate">{pascalToSentence(column)}</span>
              </div>
            </th>
          {/each}
        </tr>
        <tr>
          {#each columns as _, i}
            <td class="px-2 py-1.5">
              <div class="flex items-center gap-1.5 rounded-md px-2 py-1 bg-gray-200 dark:bg-gray-700 focus-within:ring-1 ring-gray-400 dark:ring-gray-500">
                <svg class="shrink-0 opacity-40" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input
                  type="text"
                  placeholder="Filter"
                  bind:value={filters[i]}
                  oninput={() => { page = 0; selectedIndex = undefined; }}
                  onclick={(e) => e.stopPropagation()}
                  class="w-full min-w-0 text-xs bg-transparent placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                />
              </div>
            </td>
          {/each}
        </tr>
      </thead>

      <tbody>
        {#each pageRows as record, i}
          {#if selectedIndex === i}
            <RecordDetail
              {record}
              {columns}
              {tableName}
              {query}
              onclose={() => selectedIndex = undefined}
            />
          {:else}
            <tr
              class="{selectedIndex !== i - 1 ? 'border-t border-t-gray-400/50' : ''} hover:bg-gray-400 dark:hover:bg-gray-500 cursor-pointer select-none"
              onclick={() => selectedIndex = selectedIndex === i ? undefined : i}
            >
              {#each record as cell}
                <td class="min-w-32 max-w-96 overflow-hidden truncate px-3 py-1.5">
                  {cell}
                </td>
              {/each}
            </tr>
          {/if}
        {:else}
          <tr>
            <td colspan={columns.length} class="px-3 py-4 text-center text-gray-500 dark:text-gray-400 italic">
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
