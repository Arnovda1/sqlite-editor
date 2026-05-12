<script lang="ts">

  let {
    data,
  }: {
    data: { columns: string[]; rows: any[][] },
  } = $props();

</script>

{JSON.stringify(data)}