const ORBIT_ID_DIGIT_LENGTH = 18;
const ORBIT_ID_PATTERN = /^[A-Z]{2}\d{18}$/;
const FALLBACK_ORBIT_ID_SEED = 'orbitx-guest-user';

function hash32(value: string, seed: number) {
  let hash = seed >>> 0;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
    hash = (hash + 0x9e3779b9) >>> 0;
  }

  return hash >>> 0;
}

function toLetter(value: number) {
  return String.fromCharCode(65 + (value % 26));
}

function buildSeed(input: { userId?: string; email?: string; name?: string }) {
  return (
    [input.userId, input.email?.trim().toLowerCase(), input.name?.trim().toLowerCase()]
      .filter(Boolean)
      .join('|') || FALLBACK_ORBIT_ID_SEED
  );
}

export function isOrbitUserId(value?: string | null): value is string {
  return typeof value === 'string' && ORBIT_ID_PATTERN.test(value);
}

export function deriveOrbitUserId(input: { userId?: string; email?: string; name?: string }) {
  const seed = buildSeed(input);
  const primary = hash32(seed, 0x811c9dc5);
  const secondary = hash32([...seed].reverse().join(''), 0x1f123bb5);
  const tertiary = hash32(`${seed}:${seed.length}`, 0x9e3779b1);

  const digits = [
    primary.toString().padStart(10, '0'),
    secondary.toString().padStart(10, '0'),
    tertiary.toString().padStart(10, '0'),
  ]
    .join('')
    .slice(0, ORBIT_ID_DIGIT_LENGTH);

  return `${toLetter(primary)}${toLetter(secondary)}${digits}`;
}

export function ensureOrbitUserId(
  currentOrbitId: string | null | undefined,
  input: { userId?: string; email?: string; name?: string },
): string {
  if (isOrbitUserId(currentOrbitId)) {
    return currentOrbitId;
  }

  return deriveOrbitUserId(input);
}
