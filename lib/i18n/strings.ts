import { stackBs, stackEn } from '@/lib/i18n/stackCatalog';

export type Locale = 'en' | 'bs' | 'de';

type StackKey = keyof typeof stackEn;

export type StringKey =
  | 'tabs.home'
  | 'tabs.trips'
  | 'tabs.library'
  | 'tabs.weapons'
  | 'tabs.more'
  | 'home.subtitle'
  | 'home.newTrip'
  | 'home.browseTrips'
  | 'home.recentTrips'
  | 'home.seeAll'
  | 'home.latestTargets'
  | 'home.library'
  | 'home.noTrips'
  | 'home.noTripsHint'
  | 'home.noTargets'
  | 'home.noTargetsHint'
  | 'home.tripRowSub'
  | 'home.completed'
  | 'home.inProgress'
  | 'home.phaseSubtitle'
  | 'home.allTimeShots'
  | 'trips.intro'
  | 'trips.start'
  | 'trips.yourTrips'
  | 'trips.newTrip'
  | 'trips.empty'
  | 'trips.emptyHint'
  | 'trips.done'
  | 'trips.open'
  | 'library.intro'
  | 'library.allTargets'
  | 'library.empty'
  | 'library.emptyHint'
  | 'library.rowSubTemplate'
  | 'weapons.intro'
  | 'weapons.add'
  | 'weapons.addWeapon'
  | 'weapons.arsenal'
  | 'weapons.empty'
  | 'weapons.emptyHint'
  | 'weapons.roundsTotal'
  | 'weapons.tapDetails'
  | 'more.intro'
  | 'more.about'
  | 'more.privacyTitle'
  | 'more.privacySub'
  | 'more.unitsTitle'
  | 'more.unitsSub'
  | 'more.fundamentals'
  | 'more.language'
  | 'more.langEn'
  | 'more.langBs'
  | 'more.langDe'
  | 'common.roundsFired'
  | 'common.custom'
  | 'common.save'
  | 'common.saving'
  | 'stack.newTrip'
  | 'stack.trip'
  | 'stack.editTrip'
  | 'stack.addWeapon'
  | 'stack.weapon'
  | 'stack.editWeapon'
  | 'stack.target'
  | 'stack.scoreTarget'
  | 'template.b27'
  | 'maintenance.sectionTitle'
  | 'maintenance.intro'
  | 'maintenance.enable'
  | 'maintenance.interval'
  | 'maintenance.markDone'
  | 'maintenance.due'
  | 'maintenance.untilDue'
  | 'maintenance.ownedRounds'
  | 'maintenance.listDue'
  | 'maintenance.notifTitle'
  | 'maintenance.notifBody'
  | 'maintenance.badge'
  | 'home.maintenanceDue'
  | 'home.maintenanceRowSub'
  | StackKey;

type Catalog = Record<StringKey, string>;

const en: Catalog = {
  'tabs.home': 'WhatShotz',
  'tabs.trips': 'Trips',
  'tabs.library': 'Library',
  'tabs.weapons': 'Weapons',
  'tabs.more': 'More',
  'home.subtitle': 'Shooting journal — trips, targets, brass‑ring scoring',
  'home.newTrip': 'New trip',
  'home.browseTrips': 'Browse trips',
  'home.recentTrips': 'Recent trips',
  'home.seeAll': 'See all',
  'home.latestTargets': 'Latest targets',
  'home.library': 'Library',
  'home.noTrips': 'No trips yet',
  'home.noTripsHint': 'Start a trip to log range visits and attach targets.',
  'home.noTargets': 'No targets yet',
  'home.noTargetsHint': 'Add a photo from a trip, then score it on the B‑27 template.',
  'home.tripRowSub': 'Trip detail, weapons, and targets',
  'home.completed': 'Completed',
  'home.inProgress': 'In progress',
  'home.phaseSubtitle': 'Phase 1 · offline range log',
  'home.allTimeShots': 'All‑time shots fired: {count}',
  'trips.intro': 'Log range visits, weapons, and target photos per trip.',
  'trips.start': 'Start',
  'trips.yourTrips': 'Your trips',
  'trips.newTrip': 'New trip',
  'trips.empty': 'No trips logged yet',
  'trips.emptyHint': 'Create a trip to get started.',
  'trips.done': 'Done',
  'trips.open': 'Open',
  'library.intro': 'All target photos saved from trips — open any to score or review.',
  'library.allTargets': 'All targets',
  'library.empty': 'No target photos yet',
  'library.emptyHint': 'Capture a target from a trip, then open it to score.',
  'library.rowSubTemplate': 'Template · {template}',
  'weapons.intro': 'Track pistols and rifles you own, rent, or borrow on trips.',
  'weapons.add': 'Add',
  'weapons.addWeapon': 'Add weapon',
  'weapons.arsenal': 'Arsenal',
  'weapons.empty': 'No weapons yet',
  'weapons.emptyHint': 'Add pistols or rifles you own, rent, or borrow.',
  'weapons.roundsTotal': '{count} rounds logged',
  'weapons.tapDetails': 'Tap for details',
  'more.intro': 'Privacy, units, and language.',
  'more.about': 'About this build',
  'more.privacyTitle': 'Privacy',
  'more.privacySub': 'Trips, photos, and scores stay on this device. No cloud sync in Phase 1.',
  'more.unitsTitle': 'Units',
  'more.unitsSub': 'Metric defaults (°C, m/s) — full settings UI comes later.',
  'more.fundamentals': 'Fundamentals',
  'more.language': 'Language',
  'more.langEn': 'English',
  'more.langBs': 'Bosnian',
  'more.langDe': 'German',
  'common.roundsFired': 'Rounds fired',
  'common.custom': 'Custom',
  'common.save': 'Save',
  'common.saving': 'Saving…',
  'stack.newTrip': 'New trip',
  'stack.trip': 'Trip',
  'stack.editTrip': 'Edit trip',
  'stack.addWeapon': 'Add weapon',
  'stack.weapon': 'Weapon',
  'stack.editWeapon': 'Edit weapon',
  'stack.target': 'Target',
  'stack.scoreTarget': 'Score target',
  'template.b27': 'B‑27 (Baker)',
  'maintenance.sectionTitle': 'Maintenance schedule',
  'maintenance.intro':
    'Reminders based on total rounds logged for each weapon on trips. Tap “Mark service complete” after cleaning.',
  'maintenance.enable': 'Enable reminders',
  'maintenance.interval': 'Service every (rounds)',
  'maintenance.markDone': 'Mark service complete',
  'maintenance.due': 'Service due now',
  'maintenance.untilDue': '{count} rounds until service',
  'maintenance.ownedRounds': 'Owned rounds logged: {count}',
  'maintenance.listDue': 'Maintenance due',
  'maintenance.notifTitle': 'Weapon maintenance',
  'maintenance.notifBody': '{name}: {rounds} rounds since last service',
  'maintenance.badge': 'Service due',
  'home.maintenanceDue': 'Maintenance due',
  'home.maintenanceRowSub': '{count} rounds since service — tap to open weapon',
  ...stackEn,
};

const bs: Catalog = {
  ...en,
  'tabs.trips': 'Izleti',
  'tabs.library': 'Biblioteka',
  'tabs.weapons': 'Oružje',
  'tabs.more': 'Više',
  'home.subtitle': 'Dnevnik gađanja — izleti, mete, bodovanje',
  'home.newTrip': 'Novi izlet',
  'home.browseTrips': 'Pregled izleta',
  'home.recentTrips': 'Nedavni izleti',
  'home.seeAll': 'Sve',
  'home.latestTargets': 'Zadnje mete',
  'home.library': 'Biblioteka',
  'home.noTrips': 'Još nema izleta',
  'home.noTripsHint': 'Započnite izlet da zabilježite posjetu strelištu i mete.',
  'home.noTargets': 'Još nema meta',
  'home.noTargetsHint': 'Dodajte fotografiju s izleta, zatim je ocijenite na B‑27 predlošku.',
  'home.tripRowSub': 'Detalji, oružje i mete',
  'home.completed': 'Završeno',
  'home.inProgress': 'U toku',
  'home.phaseSubtitle': 'Faza 1 · offline dnevnik',
  'home.allTimeShots': 'Ukupno ispucanih metaka: {count}',
  'trips.intro': 'Bilježite posjete strelištu, oružje i fotografije meta po izletu.',
  'trips.start': 'Početak',
  'trips.yourTrips': 'Vaši izleti',
  'trips.newTrip': 'Novi izlet',
  'trips.empty': 'Nema zabilježenih izleta',
  'trips.emptyHint': 'Kreirajte izlet da počnete.',
  'trips.done': 'Završeno',
  'trips.open': 'Otvoreno',
  'library.intro': 'Sve fotografije meta s izleta — otvorite za ocjenu ili pregled.',
  'library.allTargets': 'Sve mete',
  'library.empty': 'Nema fotografija meta',
  'library.emptyHint': 'Dodajte metu s izleta, zatim je ocijenite.',
  'library.rowSubTemplate': 'Predložak · {template}',
  'weapons.intro': 'Pratite oružje koje posjedujete, iznajmljujete ili posuđujete na izletima.',
  'weapons.add': 'Dodaj',
  'weapons.addWeapon': 'Dodaj oružje',
  'weapons.arsenal': 'Arsenal',
  'weapons.empty': 'Još nema oružja',
  'weapons.emptyHint': 'Dodajte pištolje ili puške.',
  'weapons.roundsTotal': '{count} metaka zabilježeno',
  'weapons.tapDetails': 'Dodirnite za detalje',
  'more.intro': 'Privatnost, jedinice i jezik.',
  'more.about': 'O ovoj verziji',
  'more.privacyTitle': 'Privatnost',
  'more.privacySub': 'Izleti, fotografije i rezultati ostaju na uređaju. Nema cloud sinhronizacije.',
  'more.unitsTitle': 'Jedinice',
  'more.unitsSub': 'Metrički zadano (°C, m/s) — puni postavke kasnije.',
  'more.fundamentals': 'Osnove',
  'more.language': 'Jezik',
  'more.langEn': 'Engleski',
  'more.langBs': 'Bosanski',
  'more.langDe': 'Njemački',
  'common.roundsFired': 'Ispucanih metaka',
  'common.custom': 'Prilagođeno',
  'common.save': 'Sačuvaj',
  'common.saving': 'Čuvanje…',
  'stack.newTrip': 'Novi izlet',
  'stack.trip': 'Izlet',
  'stack.editTrip': 'Uredi izlet',
  'stack.addWeapon': 'Dodaj oružje',
  'stack.weapon': 'Oružje',
  'stack.editWeapon': 'Uredi oružje',
  'stack.target': 'Meta',
  'stack.scoreTarget': 'Ocijeni metu',
  'template.b27': 'B‑27 (Baker)',
  'maintenance.sectionTitle': 'Raspored održavanja',
  'maintenance.intro':
    'Podsjetnici prema ukupno zabilježenim metkama na izletima. Nakon čišćenja označi „Servis obavljen”.',
  'maintenance.enable': 'Uključi podsjetnike',
  'maintenance.interval': 'Servis svakih (metaka)',
  'maintenance.markDone': 'Označi servis obavljen',
  'maintenance.due': 'Potrebno održavanje',
  'maintenance.untilDue': 'Još {count} metaka do servisa',
  'maintenance.ownedRounds': 'Metaka u posjedu: {count}',
  'maintenance.listDue': 'Održavanje potrebno',
  'maintenance.notifTitle': 'Održavanje oružja',
  'maintenance.notifBody': '{name}: {rounds} metaka od zadnjeg servisa',
  'maintenance.badge': 'Servis',
  'home.maintenanceDue': 'Održavanje potrebno',
  'home.maintenanceRowSub': '{count} metaka od servisa — dodirni za oružje',
  ...stackBs,
};

const de: Catalog = {
  ...en,
  'tabs.trips': 'Ausflüge',
  'tabs.library': 'Bibliothek',
  'tabs.weapons': 'Waffen',
  'tabs.more': 'Mehr',
  'home.subtitle': 'Schießtagebuch — Ausflüge, Ziele, Ringwertung',
  'home.newTrip': 'Neuer Ausflug',
  'home.browseTrips': 'Ausflüge',
  'home.recentTrips': 'Letzte Ausflüge',
  'home.seeAll': 'Alle',
  'home.latestTargets': 'Neueste Ziele',
  'home.library': 'Bibliothek',
  'home.noTrips': 'Noch keine Ausflüge',
  'home.noTripsHint': 'Starten Sie einen Ausflug, um den Besuch und Ziele zu erfassen.',
  'home.noTargets': 'Noch keine Ziele',
  'home.noTargetsHint': 'Foto vom Ausflug hinzufügen und auf der B‑27‑Vorlage werten.',
  'home.tripRowSub': 'Details, Waffen und Ziele',
  'home.completed': 'Abgeschlossen',
  'home.inProgress': 'Laufend',
  'home.phaseSubtitle': 'Phase 1 · Offline‑Protokoll',
  'home.allTimeShots': 'Schüsse gesamt: {count}',
  'trips.intro': 'Schießausflüge, Waffen und Zielfotos pro Besuch erfassen.',
  'trips.start': 'Start',
  'trips.yourTrips': 'Ihre Ausflüge',
  'trips.newTrip': 'Neuer Ausflug',
  'trips.empty': 'Keine Ausflüge',
  'trips.emptyHint': 'Legen Sie einen Ausflug an.',
  'trips.done': 'Fertig',
  'trips.open': 'Offen',
  'library.intro': 'Alle Zielfotos — zum Werten oder Ansehen öffnen.',
  'library.allTargets': 'Alle Ziele',
  'library.empty': 'Keine Zielfotos',
  'library.emptyHint': 'Ziel vom Ausflug erfassen und werten.',
  'library.rowSubTemplate': 'Vorlage · {template}',
  'weapons.intro': 'Eigene, gemietete oder geliehene Waffen je Ausflug.',
  'weapons.add': 'Hinzufügen',
  'weapons.addWeapon': 'Waffe hinzufügen',
  'weapons.arsenal': 'Arsenal',
  'weapons.empty': 'Noch keine Waffen',
  'weapons.emptyHint': 'Pistolen oder Gewehre anlegen.',
  'weapons.roundsTotal': '{count} Schuss protokolliert',
  'weapons.tapDetails': 'Tippen für Details',
  'more.intro': 'Datenschutz, Einheiten und Sprache.',
  'more.about': 'Über diesen Build',
  'more.privacyTitle': 'Datenschutz',
  'more.privacySub': 'Alles bleibt auf dem Gerät. Kein Cloud‑Sync in Phase 1.',
  'more.unitsTitle': 'Einheiten',
  'more.unitsSub': 'Metrisch (°C, m/s) — volle Einstellungen später.',
  'more.fundamentals': 'Grundlagen',
  'more.language': 'Sprache',
  'more.langEn': 'Englisch',
  'more.langBs': 'Bosnisch',
  'more.langDe': 'Deutsch',
  'common.roundsFired': 'Schüsse',
  'common.custom': 'Eigene',
  'common.save': 'Speichern',
  'common.saving': 'Speichern…',
  'stack.newTrip': 'Neuer Ausflug',
  'stack.trip': 'Ausflug',
  'stack.editTrip': 'Ausflug bearbeiten',
  'stack.addWeapon': 'Waffe hinzufügen',
  'stack.weapon': 'Waffe',
  'stack.editWeapon': 'Waffe bearbeiten',
  'stack.target': 'Ziel',
  'stack.scoreTarget': 'Ziel werten',
  'template.b27': 'B‑27 (Baker)',
  'maintenance.sectionTitle': 'Wartungsplan',
  'maintenance.intro':
    'Erinnerungen für eigene Waffen nach Schusszahl. Miete/Leihe zählt nicht.',
  'maintenance.enable': 'Erinnerungen aktivieren',
  'maintenance.interval': 'Wartung alle (Schuss)',
  'maintenance.markDone': 'Wartung erledigt',
  'maintenance.due': 'Wartung fällig',
  'maintenance.untilDue': 'Noch {count} Schuss bis Wartung',
  'maintenance.ownedRounds': 'Eigene Schuss: {count}',
  'maintenance.listDue': 'Wartung fällig',
  'maintenance.notifTitle': 'Waffenwartung',
  'maintenance.notifBody': '{name}: {rounds} Schuss seit letzter Wartung',
  'maintenance.badge': 'Wartung',
  'home.maintenanceDue': 'Wartung fällig',
  'home.maintenanceRowSub': '{count} Schuss seit Wartung — Tippen für Waffe',
};

export const CATALOG: Record<Locale, Catalog> = { en, bs, de };

export function formatString(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''));
}

export function t(locale: Locale, key: StringKey, vars?: Record<string, string | number>): string {
  const entry = CATALOG[locale][key] ?? CATALOG.en[key] ?? key;
  return formatString(entry, vars);
}
