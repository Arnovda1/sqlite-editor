import { mount } from 'svelte';
import App from './app.svelte';
import { vscode } from './vscode';

mount(App, { target: document.body });
vscode.postMessage({ type: 'ready' });
