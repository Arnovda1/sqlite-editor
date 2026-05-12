<script lang="ts">
  import type { TableTypes, QueryResult } from "../../types";

  let {
    getTables,
    query,
  }: {
    getTables: (type?: TableTypes) => Promise<string[]>
    query: (sql: string) => Promise<QueryResult>,
  } = $props();

</script>

tables inspect