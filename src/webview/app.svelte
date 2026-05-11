<script lang="ts">
  let data: any = $state(null);

  window.addEventListener('message', (event) => {
    if (event.data.type === 'load') {
      data = event.data;
    }
  });
</script>

<main class="p-4">
  <h1 class="text-xl font-bold">
    SQLite Editor {JSON.stringify(data || 'no data')}
  </h1>
  
  {#if data}
    <pre class="mt-4 text-sm">{JSON.stringify(data, null, 2)}</pre>
  {:else}
    <p class="mt-4 text-gray-500">Loading....</p>
  {/if}
</main>
