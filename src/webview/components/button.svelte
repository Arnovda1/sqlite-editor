<script lang="ts">
  import { Snippet } from "svelte";

  let {
    class: className,
    onClick: onclick,
    children,
  }: {
    class: string,
    onClick: () => void,
    children: Snippet,
  } = $props();

</script>

<!-- svelte-ignore a11y_consider_explicit_label -->
<button
  class="py-1.5 px-2.5 mt-1.5 mx-auto rounded-lg bg-gray-100 dark:bg-gray-900 text-dark dark:text-white {className}"
  {onclick}
>
  {@render children()}
</button>
