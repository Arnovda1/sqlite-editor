<script lang="ts">

  let {
    size = 'default',
    variant = 'default',
    class: className = '',
    isActive = false,
    onclick: onClick,
    children,
  }: {
    size?: 'icon' | 'default',
    variant?: 'default' | 'ghost',
    class?: string,
    isActive?: boolean,
    onclick: () => void,
    children: import("svelte").Snippet,
  } = $props();

</script>

<!-- svelte-ignore a11y_consider_explicit_label -->
<button
  class="mx-auto cursor-pointer rounded-lg transition-transform active:translate-y-0.5 active:shadow-none
    {size === 'default' ? 'py-1.5 px-2.5' : 'p-1'}
    {variant === 'ghost'
      ? 'bg-transparent hover:bg-gray-400/40 dark:hover:bg-gray-500/40 text-gray-600 dark:text-gray-400'
      : isActive
        ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
        : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white'}
    {className}
  "
  onclick={onClick}
>
  {@render children()}
</button>
