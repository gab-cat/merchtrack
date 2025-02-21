export const toSentenceCase = (str: string) => {
  return str
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/(^\w)|(\s+\w)/g, letter => letter.toUpperCase());
};

export { convertDecimalToNumber } from './convertDecimalToNumbers';
export { verifyPermission } from './permissions';
export { calculatePagination, removeFields } from './query.utils';
export { generateUniqueSlug, slugify } from './slug.utils';
export { toManilaTime } from './formatTime';
export { formatDate, prettyFormatDate } from './format';
export { formatCurrency } from './formatCurrency';
export { processActionReturnData } from './processActionReturnData';