<script lang="ts">

  let {
    pageCount,
    page = $bindable(),
    selectedIndex = $bindable(),
  }: {
    pageCount: number,
    page: number,
    selectedIndex?: number,
  } = $props();

</script>

<div class="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400" style="visibility: {pageCount > 1 ? 'visible' : 'hidden'}">
  <button
    class="px-2 py-1 rounded disabled:opacity-40 enabled:hover:bg-gray-300 dark:enabled:hover:bg-gray-600"
    disabled={page === 0}
    onclick={() => { page--; selectedIndex = undefined; }}
  >← Prev</button>
  <span>Page {page + 1} of {pageCount}</span>
  <button
    class="px-2 py-1 rounded disabled:opacity-40 enabled:hover:bg-gray-300 dark:enabled:hover:bg-gray-600"
    disabled={page === pageCount - 1}
    onclick={() => { page++; selectedIndex = undefined; }}
  >Next →</button>
</div>