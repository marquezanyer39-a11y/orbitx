const SESSION_STORE = new Map();
const MAX_TURNS = 10;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

export function getAstraSessionKey({ userId, sessionId }) {
  return `${`${userId ?? 'guest'}`.trim() || 'guest'}:${`${sessionId ?? 'default'}`.trim() || 'default'}`;
}

export function getAstraMemorySession(identity) {
  const key = getAstraSessionKey(identity);
  if (!SESSION_STORE.has(key)) {
    SESSION_STORE.set(key, {
      key,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      history: [],
      facts: {
        lastIntent: null,
        lastToolNames: [],
        walletCreated: false,
        identityVerified: false,
        lastScreen: null,
        lastTask: null,
      },
    });
  }

  return SESSION_STORE.get(key);
}

export function appendAstraMemoryTurn(identity, turn) {
  const session = getAstraMemorySession(identity);
  session.history = [...session.history, { ...turn, createdAt: nowIso() }].slice(-MAX_TURNS);
  session.updatedAt = nowIso();
  return clone(session);
}

export function updateAstraMemoryFacts(identity, nextFacts) {
  const session = getAstraMemorySession(identity);
  session.facts = {
    ...session.facts,
    ...nextFacts,
  };
  session.updatedAt = nowIso();
  return clone(session);
}

export function buildAstraMemorySummary(identity) {
  const session = getAstraMemorySession(identity);

  return {
    facts: clone(session.facts),
    recentTurns: session.history.slice(-6).map((turn) => ({
      role: turn.role,
      text: turn.text,
    })),
  };
}

export function resetAstraMemory(identity) {
  const key = getAstraSessionKey(identity);
  SESSION_STORE.delete(key);
}
