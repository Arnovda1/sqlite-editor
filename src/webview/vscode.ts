declare function acquireVsCodeApi(): { postMessage: (msg: any) => void };
export const vscode = acquireVsCodeApi();
