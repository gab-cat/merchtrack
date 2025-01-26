export const toSentenceCase = (str: string) => {
  return str
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/(^\w)|(\s+\w)/g, letter => letter.toUpperCase());
};