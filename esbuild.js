const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',
	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

async function main() {
	const { default: esbuildSvelte } = await import('esbuild-svelte');

	// Extension (Node.js)
	const extCtx = await esbuild.context({
		entryPoints: ['src/extension.ts'],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [esbuildProblemMatcherPlugin],
	});

	// Webview (browser + Svelte)
	const webCtx = await esbuild.context({
		entryPoints: ['src/webview/main.ts'],
		bundle: true,
		format: 'iife',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'browser',
		outfile: 'dist/webview.js',
		logLevel: 'silent',
		plugins: [esbuildSvelte(), esbuildProblemMatcherPlugin],
	});

	// Copy sql.js wasm file to dist
	const wasmSrc = path.join(__dirname, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
	const wasmDest = path.join(__dirname, 'dist', 'sql-wasm.wasm');
	fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
	fs.copyFileSync(wasmSrc, wasmDest);

	if (watch) {
		await extCtx.watch();
		await webCtx.watch();
	} else {
		await extCtx.rebuild();
		await extCtx.dispose();
		await webCtx.rebuild();
		await webCtx.dispose();
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
