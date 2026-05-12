<script lang="ts">
  let {
    error,
    small = false,
    class: className = '',
  }: {
    error?: string | null,
    small?: boolean,
    class?: string,
  } = $props();
</script>

{#if error}
  <p class={`rounded-md bg-red-400/10 text-sm text-red-400 px-3 ${small ? 'text-sm py-0.5' : 'py-2'} ${className}`}>
    {error}
  </p>
{/if}