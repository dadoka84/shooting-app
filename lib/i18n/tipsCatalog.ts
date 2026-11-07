/** Shooting tips shown on the weapons tab (merged into locale catalogs). */

export const TIP_DISPLAY_ORDER = [
  'tip-grip',
  'tip-trigger',
  'tip-sight',
  'tip-stance',
  'tip-breathing',
] as const;

export type TipId = (typeof TIP_DISPLAY_ORDER)[number];

export const tipsEn = {
  'tips.grip.title': 'Consistent grip',
  'tips.grip.body':
    'Same hand placement each shot. Avoid changing grip pressure mid-string.',
  'tips.trigger.title': 'Smooth trigger press',
  'tips.trigger.body':
    'Press straight back without jerking. Follow through after the break.',
  'tips.sight.title': 'Sight picture',
  'tips.sight.body':
    'Focus on the front sight; let the target blur slightly behind it.',
  'tips.stance.title': 'Stable stance',
  'tips.stance.body':
    'Feet shoulder-width, weight slightly forward. Minimize movement between shots.',
  'tips.breathing.title': 'Breath control',
  'tips.breathing.body':
    'Exhale halfway, hold briefly on the shot, then resume breathing.',
};

export const tipsBs = {
  'tips.grip.title': 'Dosljedan hvat',
  'tips.grip.body':
    'Isti položaj ruku pri svakom metku. Ne mijenjajte pritisak hvata usred serije.',
  'tips.trigger.title': 'Gladak pritisak na obarač',
  'tips.trigger.body':
    'Pritišćite ravno unazad bez trzaja. Nastavite pratiti nakon ispucavanja.',
  'tips.sight.title': 'Nišan',
  'tips.sight.body':
    'Fokusirajte se na prednji nišan; meta neka bude blago zamućena.',
  'tips.stance.title': 'Stabilan stas',
  'tips.stance.body':
    'Stopala na širini ramena, težište malo naprijed. Minimizirajte pomjeranje između metaka.',
  'tips.breathing.title': 'Kontrola daha',
  'tips.breathing.body':
    'Izdahnite do pola, kratko zadržite dah pri metku, zatim nastavite disati.',
};

export const tipsDe = {
  'tips.grip.title': 'Einheitlicher Griff',
  'tips.grip.body':
    'Gleiche Handposition bei jedem Schuss. Griffdruck in der Serie nicht ändern.',
  'tips.trigger.title': 'Ruhiger Abzug',
  'tips.trigger.body':
    'Gerade nach hinten drücken, ohne zu reißen. Nach dem Schuss durchziehen.',
  'tips.sight.title': 'Visierbild',
  'tips.sight.body':
    'Fokus auf das Korn; die Scheibe bleibt leicht unscharf.',
  'tips.stance.title': 'Stabiler Stand',
  'tips.stance.body':
    'Füße schulterbreit, Gewicht leicht nach vorn. Wenig Bewegung zwischen Schüssen.',
  'tips.breathing.title': 'Atemkontrolle',
  'tips.breathing.body':
    'Halb ausatmen, kurz anhalten beim Schuss, dann weiter atmen.',
};

export function tipTitleKey(tipId: string): keyof typeof tipsEn {
  const slug = tipId.replace(/^tip-/, '');
  return `tips.${slug}.title` as keyof typeof tipsEn;
}

export function tipBodyKey(tipId: string): keyof typeof tipsEn {
  const slug = tipId.replace(/^tip-/, '');
  return `tips.${slug}.body` as keyof typeof tipsEn;
}
