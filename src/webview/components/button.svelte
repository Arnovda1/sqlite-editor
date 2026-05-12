<script lang="ts">

  let {
    class: className = '',
    onclick: onClick,
    children,
  }: {
    class?: string,
    onclick: () => void,
    children: import("svelte").Snippet,
  } = $props();

</script>

<!-- svelte-ignore a11y_consider_explicit_label -->
<button
  class="py-1.5 px-2.5 mt-1.5 mx-auto cursor-pointer rounded-lg bg-gray-100 dark:bg-gray-900 text-dark dark:text-white active:translate-y-0.5 active:shadow-none transition-transform {className}"
  onclick={onClick}
>
  {@render children()}
</button>
