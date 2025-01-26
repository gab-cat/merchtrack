/**
 * Converts a given UTC date to Manila time in 'YYYY-MM-DD HH:mm:ss' format.
 * @param {Date | string} utcDate - The UTC date to be converted.
 * @returns {string} - The formatted date string in Manila time.
 */
export function toManilaTime(utcDate: Date | string): string {
  const date = new Date(utcDate);
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date provided');
  }
  return date.toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * An object containing methods to format dates and times to Manila time.
 */
export const manilaTime = {
  /**
   * Converts a given UTC date to Manila date and time in 'YYYY-MM-DD HH:mm:ss' format.
   * @param {Date | string} utcDate - The UTC date to be converted.
   * @returns {string} - The formatted date and time string in Manila time.
   */
  dateTime: (utcDate: Date | string): string => toManilaTime(utcDate),

  /**
   * Converts a given UTC date to Manila date in 'YYYY-MM-DD' format.
   * @param {Date | string} utcDate - The UTC date to be converted.
   * @returns {string} - The formatted date string in Manila time.
   */
  dateOnly: (utcDate: Date | string): string => {
    const date = new Date(utcDate);
    return date.toLocaleDateString('en-PH', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  },

  /**
   * Converts a given UTC date to Manila time in 'HH:mm' format.
   * @param {Date | string} utcDate - The UTC date to be converted.
   * @returns {string} - The formatted time string in Manila time.
   */
  timeOnly: (utcDate: Date | string): string => {
    const date = new Date(utcDate);
    return date.toLocaleTimeString('en-PH', {
      timeZone: 'Asia/Manila',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
};

// Usage examples:

// Convert a UTC date to Manila date and time
// const utcDate = new Date('2023-10-10T10:00:00Z');
// console.log(toManilaTime(utcDate)); // Output: '10/10/2023, 18:00:00'

// // Using manilaTime object
// console.log(manilaTime.dateTime(utcDate)); // Output: '10/10/2023, 18:00:00'
// console.log(manilaTime.dateOnly(utcDate)); // Output: '10/10/2023'
// console.log(manilaTime.timeOnly(utcDate)); // Output: '18:00'