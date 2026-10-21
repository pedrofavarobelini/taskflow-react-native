// Não inclui download/compilação Metro nem abertura do Expo Go.
const clock = () => globalThis.performance?.now?.() ?? Date.now();
const start = clock();
const marks = new Set();
function markStartup(label) {
  if (marks.has(label)) return;
  marks.add(label);
  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    console.info(`[TaskFlow] ${label}: ${(clock() - start).toFixed(1)} ms desde o início do JS`);
  }
}
module.exports = { markStartup };
