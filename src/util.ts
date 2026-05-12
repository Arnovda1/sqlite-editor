import { QueryResult, TableTypes } from "./types";
import { vscode } from "./webview/vscode";

export const pascalToSentence = (str: string) => {
  if (!str) return '';
  if (str === str.toUpperCase()) return str;
  
  let result = str
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};