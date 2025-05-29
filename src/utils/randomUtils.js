/**
 * Get a random item from an array
 * @param {Array} array - The array to select from
 * @returns {*} A random item from the array, or null if empty
 */
export const getRandomItem = (array) => {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
};
