<script lang="ts">
  import { untrack } from 'svelte';
  import type { QueryResult } from '../../types';
  import Button from './button.svelte';
  import Error from './error.svelte';
  import ResultTable from './result-table.svelte';
  import { EditorView, basicSetup } from 'codemirror';
  import { keymap } from '@codemirror/view';
  import { sql, SQLite } from '@codemirror/lang-sql';
  import { indentWithTab } from '@codemirror/commands';
  import { acceptCompletion } from '@codemirror/autocomplete';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { Compartment } from '@codemirror/state';

  let {
    query,
    schema = {},
  }: {
    query: (sql: string) => Promise<QueryResult>,
    schema?: Record<string, string[]>,
  } = $props();

  let statement = $state("SELECT * FROM user");
  let result = $state<QueryResult | undefined>(undefined);
  let error = $state<string | undefined>(undefined);
  let loading = $state(false);

  let editorEl: HTMLDivElement;
  let view: EditorView;

  const themeCompartment = new Compartment();
  const sqlCompartment = new Compartment();

  function isDark() {
    const kind = document.body.getAttribute('data-vscode-theme-kind');
    return kind !== 'vscode-light';
  }

  $effect(() => {
    view = new EditorView({
      doc: untrack(() => statement),
      extensions: [
        basicSetup,
        keymap.of([
          { key: 'Tab', run: acceptCompletion },
          { key: 'Mod-Enter', run: () => { handleQuery(); return true; } },
          indentWithTab,
        ]),
        sqlCompartment.of(sql({ dialect: SQLite, schema, upperCaseKeywords: true })),
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

  $effect(() => {
    if (view && schema) {
      view.dispatch({
        effects: sqlCompartment.reconfigure(sql({ dialect: SQLite, schema, upperCaseKeywords: true })),
      });
    }
  });

  const handleQuery = async () => {
    if (!statement.trim()) return;
    error = undefined;
    result = undefined;
    loading = true;
    try {
      const res = await query(statement);
      if (res && 'error' in res) {
        error = res.error;
      } else {
        result = res;
      }
    } catch (err: any) {
      error = typeof err === 'string' ? err : err.message;
    } finally {
      loading = false;
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

{#if result || loading}
  <ResultTable data={result} title='Query result' {loading} />
{/if}
