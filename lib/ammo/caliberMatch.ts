import {
  COMMON_CALIBERS,
  CUSTOM_CALIBER_ID,
  resolveCaliberLabel,
  type CaliberPick,
  type CommonCaliberId,
} from '@/lib/ammo/calibers';

const ALIASES: Record<string, CommonCaliberId> = {
  '9mm': '9mm',
  '9mmluger': '9mm',
  '9mmparabellum': '9mm',
  '9x19': '9mm',
  '9x19mm': '9mm',
  '556': '223',
  '556x45': '223',
  '556nato': '223',
  '223rem': '223',
  '762': '308',
  '762x51': '308',
  '762nato': '308',
  '308win': '308',
  '7.62x51': '308',
  '762x39mm': '762x39',
  '45acpauto': '45acp',
  '45auto': '45acp',
  '40sandw': '40sw',
  '40swandw': '40sw',
  '357magnum': '357mag',
  '38spl': '38sp',
  '38special': '38sp',
  '380auto': '380acp',
  '12ga': '12ga',
  '12gauge': '12ga',
  '20ga': '20ga',
  '20gauge': '20ga',
};

function squash(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/×/g, 'x')
    .replace(/\s+/g, '')
    .replace(/^\./, '');
}

function tokensForLabel(label: string): string[] {
  const parts = label.split('/').map((p) => squash(p));
  return [squash(label), ...parts].filter(Boolean);
}

/** Stable id for matching weapon, ammo lots, and trip deductions. */
export function caliberMatchKey(raw: string): string {
  const sq = squash(raw);
  if (!sq) return 'custom:';

  for (const c of COMMON_CALIBERS) {
    const tokenSet = tokensForLabel(c.label);
    if (tokenSet.includes(sq) || c.id === sq) {
      return c.id;
    }
  }

  const alias = ALIASES[sq];
  if (alias) return alias;

  return `custom:${sq}`;
}

export function calibersMatch(a: string, b: string): boolean {
  return caliberMatchKey(a) === caliberMatchKey(b);
}

/** Canonical catalog label for storage (ammo + weapons). */
export function canonicalCaliberLabel(raw: string): string {
  const key = caliberMatchKey(raw);
  if (key.startsWith('custom:')) {
    return raw.trim();
  }
  const row = COMMON_CALIBERS.find((c) => c.id === key);
  return row?.label ?? raw.trim();
}

/** Stored value for DB — same canonical string as ammo lots. */
export function resolveStoredCaliber(pick: CaliberPick, customText: string): string {
  return canonicalCaliberLabel(resolveCaliberLabel(pick, customText));
}

export function inferCaliberPickFromStored(stored: string): { pick: CaliberPick; customText: string } {
  const trimmed = stored.trim();
  if (!trimmed) {
    return { pick: '9mm', customText: '' };
  }
  const key = caliberMatchKey(trimmed);
  if (!key.startsWith('custom:')) {
    return { pick: key as CommonCaliberId, customText: '' };
  }
  return { pick: CUSTOM_CALIBER_ID, customText: trimmed };
}
