<script lang="ts">
  import { untrack } from 'svelte';
  import type { QueryResult } from '../../types';
  import Button from './button.svelte';
  import Error from './error.svelte';
  import ResultTable from './result-table.svelte';
  import { EditorView, basicSetup } from 'codemirror';
  import { sql } from '@codemirror/lang-sql';
  import { oneDark } from '@codemirror/theme-one-dark';

  let {
    query,
  }: {
    query: (sql: string) => Promise<QueryResult>,
  } = $props();

  let statement = $state("SELECT * FROM user");
  let result = $state<QueryResult | undefined>(undefined);
  let error = $state<string | undefined>(undefined);

  let editorEl: HTMLDivElement;
  let view: EditorView;

  $effect(() => {
    view = new EditorView({
      doc: untrack(() => statement),
      extensions: [
        basicSetup,
        sql(),
        oneDark,
        EditorView.theme({
          '.cm-scroller': { minHeight: '16rem' },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            statement = update.state.doc.toString();
          }
        }),
      ],
      parent: editorEl,
    });

    return () => view.destroy();
  });

  const handleQuery = async () => {
    error = undefined;
    try {
      result = await query(statement);
    } catch (err: any) {
      error = typeof err === 'string' ? err : err.message;
    }
  }
</script>

<div bind:this={editorEl} class="mb-1.5 rounded-lg overflow-hidden text-sm"></div>

<Error {error} />

<Button onclick={handleQuery}>
  QUERY
</Button>

{#if result}
  <ResultTable data={result} />
{/if}