/**
 * Generates a deterministic HSL color from a string ID.
 * @param {string} userId
 * @returns {string} HSL color string
 */
function generateUserColor(userId) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 60%)`;
}

module.exports = { generateUserColor };
