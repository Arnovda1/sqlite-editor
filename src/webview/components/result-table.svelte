<script lang="ts">
  import type { QueryResult } from "../../types";
    import { pascalToSentence } from "../../util";

  let {
    class: className = '',
    data,
  }: {
    class?: string,
    data: QueryResult,
  } = $props();

</script>


{#if data?.columns && data.rows}
  <table class="overflow-x-auto w-full bg-gray-300 dark:bg-gray-600 rounded-lg {className}">
    <thead>
      <tr>
        {#each data.columns as column}
          <th scope="col" class="min-w-32 max-w-96">
            {pascalToSentence(column)}
          </th>
        {/each}
      </tr>
    </thead>

    <tbody>
      {#each data.rows as record}
        <tr>
          {#each record as cell}
            <td class="min-w-32 max-w-96 truncate">
              {cell}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
{/if}