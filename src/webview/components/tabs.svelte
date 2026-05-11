<script lang="ts">

  let {
    currentTab = $bindable(),
  }: {
    currentTab: 'overview' | 'query' | 'tables',
  } = $props()

  const tabs = ['overview', 'query', 'tables'];

</script>

<nav class="w-full gap-1 grid grid-cols-3 p-0.75 rounded-xl bg-gray-300 dark:bg-gray-600 my-3">
  {#each tabs as tab}
    <button
      onclick={() => currentTab = tab}
      class="
        {tab === currentTab
          ? 'text-dark dark:text-white bg-gray-100 dark:bg-gray-900 dark:border-0.5 border-gray-700 font-bold shadow-lg'
          : 'text-dark/80 dark:text-white/80 font-medium'
        }
        text-center px-0.5 py-0.75 rounded-lg select-none
      "
    >
      {tab}
    </button>
  {/each}
</nav>