<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import type { QueryResult } from '../../../types';
  import Button from '../ui/button.svelte';
  import Error from '../ui/error.svelte';
  import ResultTable from '../ui/result-table.svelte';
  import { EditorView, basicSetup } from 'codemirror';
  import { keymap } from '@codemirror/view';
  import { sql, SQLite } from '@codemirror/lang-sql';
  import { indentWithTab } from '@codemirror/commands';
  import { acceptCompletion } from '@codemirror/autocomplete';
  import { oneDark } from '@codemirror/theme-one-dark';
  import { Compartment } from '@codemirror/state';
  import { query } from '../../../queries';

  let {
    initialSql = 'SELECT * FROM user',
    initialResult,
    onSqlChange,
    onResultChange,
  }: {
    initialSql?: string,
    initialResult?: QueryResult,
    onSqlChange?: (sql: string) => void,
    onResultChange?: (result: QueryResult | undefined) => void,
  } = $props();

  let schema = $state<Record<string, string[]> | undefined>(undefined);
  let statement = $state(initialSql);
  // svelte-ignore state_referenced_locally
  let result = $state<QueryResult | undefined>(initialResult);
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

  // load schema


  // Load schema on mount
  onMount(async () => {
    const result = await query(`
      SELECT m.name as tableName, p.name as columnName
      FROM sqlite_master m
      JOIN pragma_table_info(m.name) p
      WHERE m.type IN ('table', 'view')
      ORDER BY m.name, p.cid
    `);
    if (result && !('error' in result)) {
      const newSchema: Record<string, string[]> = {};
      result.rows.forEach(([tableName, columnName]) => {
        if (!newSchema[tableName]) newSchema[tableName] = [];
        newSchema[tableName].push(columnName);
      });
      schema = newSchema;
    }
  })

  // load editor
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
            onSqlChange?.(statement);
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
        onResultChange?.(res);
      }
    } catch (err: any) {
      error = typeof err === 'string' ? err : err.message;
    } finally {
      loading = false;
    }
  }

  const refreshQuery = async () => {
    if (!statement.trim()) return;
    error = undefined;
    loading = true;
    try {
      const res = await query(statement, true);
      if (res && 'error' in res) {
        error = res.error;
      } else {
        result = res;
        onResultChange?.(res);
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
<div bind:this={editorEl} class="mb-1.5 rounded-lg overflow-hidden text-sm cursor-text border border-gray-300/40 max-h-96 overflow-y-auto" onclick={() => view?.focus()}></div>

<Error {error} class='mb-1.5' />

<Button onclick={handleQuery}>
  QUERY
</Button>

{#if result || loading}
  <ResultTable data={result} title='Query result' {loading} onRefresh={refreshQuery} />
{/if}
