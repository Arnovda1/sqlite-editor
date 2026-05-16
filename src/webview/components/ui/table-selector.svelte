<script lang="ts">
  import { onMount } from "svelte";
  import type { TableTypes } from "../../../types";
  import Button from "./button.svelte";
  import { getTables } from "../../../queries";

  let {
    selectedTable = $bindable(),
  }: {
    selectedTable?: string,
  } = $props();

  let selectedType = $state<TableTypes>(`'table', 'view'`);
  let tables = $state<string[]>([]);

  const loadTables = async (type: TableTypes, reload = false) => {
    if (!reload && selectedType !== type) {
      selectedTable = undefined;
    }
    selectedType = type;
    tables = await getTables(type, reload);
    if (selectedTable && !tables.includes(selectedTable)) {
      selectedTable = undefined;
    }
  }

  const typeOptions: { label: string; value: TableTypes }[] = [
    { label: 'All',    value: `'table', 'view'` },
    { label: 'Tables', value: `'table'` },
    { label: 'Views',  value: `'view'` },
  ];

  onMount(() => loadTables(selectedType));
</script>

<div class="flex w-fit gap-1.5">
  {#each typeOptions as option}
    <Button class="mx-0 mt-0" isActive={selectedType === option.value} onclick={() => loadTables(option.value)}>
      {option.label}
    </Button>
  {/each}
</div>

<div class="grid gap-1.5 mt-4" style="grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr))">
  {#each tables as table}
    <Button class="w-full mx-0 mt-0 truncate" isActive={selectedTable === table} onclick={() => selectedTable = table}>
      {table}
    </Button>
  {/each}
</div>