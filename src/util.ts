export const pascalToSentence = (str: string) => {
  if (!str) return '';
  
  let result = str.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
}