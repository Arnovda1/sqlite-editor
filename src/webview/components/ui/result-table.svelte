<script lang="ts">
  import type { QueryResult } from "../../../types";
  import { query } from "../../../queries";
  import Button from "./button.svelte";
  import EditableCell from "./editable-cell.svelte";
  import Error from "./error.svelte";
  import NewRecordRow from "./new-record-row.svelte";
  import ResultTablePagination from "./result-table-pagination.svelte";

  let {
    title,
    data,
    loading = false,
    tableName,
    onRefresh,
  }: {
    title: string,
    data?: QueryResult,
    loading?: boolean,
    tableName?: string,
    onRefresh?: () => void,
  } = $props();

  const PAGE_SIZE = 1000;

  let selectedCell = $state<number | undefined>(undefined);
  let selectedRecord = $state<number | undefined>(undefined);
  let page = $state(0);
  let sortCol = $state<number | undefined>(undefined);
  let sortDir = $state<'asc' | 'desc'>('asc');
  let filters = $state<string[]>([]);
  let saveError = $state<string | undefined>(undefined);
  let addingRecord = $state(false);

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
    selectedRecord = undefined;
  }

  $effect(() => {
    rows;
    page = 0;
    selectedRecord = undefined;
    sortCol = undefined;
    sortDir = 'asc';
    filters = [];
  });

  $effect(() => {
    selectedCell;
    saveError = undefined;
  });

  const sqlVal = (original: any, val: string): string => {
    if (typeof original === 'number' && !isNaN(Number(val))) return val;
    return `'${val.replace(/'/g, "''")}'`;
  }

  const deleteRecord = async (record: any[]) => {
    if (!tableName) return;
    const where = columns.map((col, j) =>
      record[j] == null
        ? `"${col}" IS NULL`
        : `"${col}" = ${sqlVal(record[j], String(record[j]))}`
    ).join(' AND ');
    const result = await query(`DELETE FROM "${tableName}" WHERE ${where}`);
    if (result && 'error' in result) {
      saveError = result.error;
    } else {
      onRefresh?.();
    }
  }
</script>

{#if loading}
  <div class="flex items-center justify-between mt-4">
    <p class="font-bold text-lg">{title}</p>
    {#if onRefresh}
      <button onclick={onRefresh} class="p-1 rounded hover:bg-gray-400/40 dark:hover:bg-gray-500/40 text-gray-500 dark:text-gray-400" title="Refresh">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
      </button>
    {/if}
  </div>

  <!-- reserved space for pagination -->
  <div class="h-8"></div>

  <div class="mt-1.5 rounded-lg p-6 bg-gray-100 dark:bg-gray-600 flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
    <div class="animate-spin">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    </div>
    Loading
  </div>
{:else if data?.columns && data.rows}

  <div class="flex items-center justify-between mt-4">
    <p class="font-bold text-lg">{title}</p>
    <div class="flex items-center gap-3">
      <span class="text-xs text-gray-500 dark:text-gray-400">
        {sortedRows.length !== rows.length ? `${sortedRows.length} / ` : ''}{rows.length} rows
      </span>
      {#if tableName}
        <Button onclick={() => { addingRecord = true; }} size='icon'>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        </Button>
      {/if}
      {#if onRefresh}
        <Button onclick={onRefresh} size='icon'>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-cw-icon lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
        </Button>
      {/if}
    </div>
  </div>

  <ResultTablePagination
    {pageCount}
    bind:page={page}
    bind:selectedIndex={selectedRecord}
  />

  <div class="overflow-x-auto mt-1.5 rounded-lg p-3 bg-gray-100 dark:bg-gray-600">
    <table class="w-full">
      <thead>
        <tr>
          {#if tableName}<th></th>{/if}
          {#each columns as column, i}
            <th
              scope="col"
              class="min-w-40 max-w-96 px-3 py-1.5 rounded-lg cursor-pointer select-none hover:bg-gray-400/40 dark:hover:bg-gray-500/40 {sortCol === i ? 'bg-gray-400/40 dark:bg-gray-500/40' : ''}"
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
                <span class="truncate">{column}</span>
              </div>
            </th>
          {/each}
        </tr>
        <tr>
          {#if tableName}<td></td>{/if}
          {#each columns as _, i}
            <td class="px-2 py-1.5">
              <div class="flex items-center gap-1.5 rounded-md px-2 py-1 bg-gray-200 dark:bg-gray-700 focus-within:ring-1 ring-gray-400 dark:ring-gray-500">
                <svg class="shrink-0 opacity-40" xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input
                  type="text"
                  placeholder="Filter"
                  bind:value={filters[i]}
                  oninput={() => { page = 0; selectedRecord = undefined; }}
                  onclick={(e) => e.stopPropagation()}
                  class="w-full min-w-0 text-xs bg-transparent placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                />
              </div>
            </td>
          {/each}
        </tr>
      </thead>

      <tbody>
        {#if addingRecord}
          <NewRecordRow
            {columns}
            tableName={tableName!}
            onSave={() => { addingRecord = false; onRefresh?.(); }}
            onCancel={() => { addingRecord = false; }}
          />
        {/if}
        {#each pageRows as record, i}
          {@const isSelectedRow = selectedRecord === i}
          <tr
            class="border-t border-t-gray-400/50 select-none group"
            onclick={() => selectedRecord = selectedRecord === i ? undefined : i}
          >

            {#if tableName}
              <td class="px-1 py-1.5 w-6" onclick={(e) => e.stopPropagation()}>
                <Button onclick={() => deleteRecord(record)} size='icon' variant='ghost'>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash"><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </Button>
              </td>
            {/if}
            {#each record as cell, j}
              {@const isSelectedCell = isSelectedRow && selectedCell === j}

              <td 
                onclick={() => selectedCell = j}
                class="
                  min-w-40 max-w-96 overflow-hidden truncate px-3 py-1.5
                  {isSelectedCell ? '' : 'hover:bg-gray-400/80 dark:hover:bg-gray-500/80 cursor-text'}
                "
              >
                {#if isSelectedCell}
                  <EditableCell
                    initialContent={cell}
                    closeEditor={() => selectedCell = undefined}
                    {tableName}
                    column={columns[j]}
                    allColumns={columns}
                    originalRow={record}
                    bind:error={saveError}
                  />
                {:else}
                  {cell}
                {/if}
              </td>
            {/each}

            
          </tr>
          <tr>
            <td colspan={record.length + (tableName ? 1 : 0)}>
              {#if isSelectedRow}
                <Error error={saveError} class='mb-2 mt-1' />
              {/if}
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan={columns.length + (tableName ? 1 : 0)} class="px-3 py-4 text-center text-gray-500 dark:text-gray-400 italic">
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
    bind:selectedIndex={selectedRecord}
  />

{/if}
