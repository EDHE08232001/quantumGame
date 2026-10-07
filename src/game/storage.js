// Campaign progress, kept in this browser's localStorage.
const KEY = 'qubits-vs-noise:v1'

const DEFAULTS = { unlocked: 1, stars: {}, bestEndless: 0, bonusShots: 0, muted: false, autoCollect: false }

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY)
    const data = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
    // ?unlockAll opens every level for this visit only; it is never saved.
    data.unlockAll = typeof location !== 'undefined' && new URLSearchParams(location.search).has('unlockAll')
    return data
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveProgress(p) {
  try {
    const saved = { ...p }
    delete saved.unlockAll
    localStorage.setItem(KEY, JSON.stringify(saved))
  } catch {
    // Progress just won't persist (private mode, blocked storage).
  }
}
