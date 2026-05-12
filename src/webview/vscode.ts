declare function acquireVsCodeApi(): { postMessage: (msg: any) => void };

export const vscode = acquireVsCodeApi() as {
  postMessage: (msg: any) => void;
  getState: () => any;
  setState: (state: any) => void;
};
