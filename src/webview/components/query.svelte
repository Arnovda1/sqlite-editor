<script lang="ts">
  import { untrack } from 'svelte';
  import type { QueryResult } from '../../types';
  import Button from './button.svelte';
  import Error from './error.svelte';
  import ResultTable from './result-table.svelte';
  import { EditorView, basicSetup } from 'codemirror';
  import { sql } from '@codemirror/lang-sql';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { Compartment } from '@codemirror/state';

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

  const themeCompartment = new Compartment();

  function isDark() {
    const kind = document.body.getAttribute('data-vscode-theme-kind');
    return kind !== 'vscode-light';
  }

  $effect(() => {
    view = new EditorView({
      doc: untrack(() => statement),
      extensions: [
        basicSetup,
        sql(),
        themeCompartment.of(isDark() ? oneDark : []),
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

    const observer = new MutationObserver(() => {
      view.dispatch({
        effects: themeCompartment.reconfigure(isDark() ? oneDark : []),
      });
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-vscode-theme-kind'] });

    return () => {
      observer.disconnect();
      view.destroy();
    };
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

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div bind:this={editorEl} class="mb-1.5 rounded-lg overflow-hidden text-sm cursor-text" onclick={() => view?.focus()}></div>

<Error {error} />

<Button onclick={handleQuery}>
  QUERY
</Button>

{#if result}
  <ResultTable data={result} />
{/if}