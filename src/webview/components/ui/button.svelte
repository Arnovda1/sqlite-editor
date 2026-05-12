<script lang="ts">

  let {
    class: className = '',
    isActive = false,
    onclick: onClick,
    children,
  }: {
    class?: string,
    isActive?: boolean,
    onclick: () => void,
    children: import("svelte").Snippet,
  } = $props();

</script>

<!-- svelte-ignore a11y_consider_explicit_label -->
<button
  class="py-1.5 px-2.5 mt-1.5 mx-auto cursor-pointer rounded-lg transition-transform active:translate-y-0.5 active:shadow-none
    {isActive
      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
      : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white'}
    {className}"
  onclick={onClick}
>
  {@render children()}
</button>
