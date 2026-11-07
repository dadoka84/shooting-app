import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { RoundsFiredPicker } from '@/components/RoundsFiredPicker';
import { Card, SecondaryButton, SectionHeader } from '@/components/ui';
import { AppColors } from '@/constants/theme';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import {
  completeWeaponMaintenance,
  getMaintenanceSchedule,
  getWeaponLoggedRoundsTotal,
  maintenanceProgress,
  upsertMaintenanceSchedule,
} from '@/lib/db/maintenanceRepository';
import { useI18n } from '@/lib/i18n/I18nProvider';
import {
  ensureNotificationPermissions,
  syncWeaponMaintenanceNotifications,
} from '@/lib/maintenance/notifications';
import type { WeaponMaintenanceSchedule } from '@/lib/types';

const DEFAULT_INTERVAL = 100;

type Props = {
  weaponId: string;
};

export function WeaponMaintenanceSection({ weaponId }: Props) {
  const { db, bumpRefresh } = useDatabase();
  const { t } = useI18n();
  const [ownedRounds, setOwnedRounds] = useState(0);
  const [schedule, setSchedule] = useState<WeaponMaintenanceSchedule | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [interval, setInterval] = useState(DEFAULT_INTERVAL);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setOwnedRounds(await getWeaponLoggedRoundsTotal(db, weaponId));
    const s = await getMaintenanceSchedule(db, weaponId);
    setSchedule(s);
    if (s) {
      setEnabled(s.enabled === 1);
      setInterval(s.interval_rounds);
    } else {
      setEnabled(false);
      setInterval(DEFAULT_INTERVAL);
    }
  }, [db, weaponId]);

  useEffect(() => {
    load();
  }, [load]);

  const progress = schedule ? maintenanceProgress(schedule, ownedRounds) : null;

  const persist = async (nextEnabled: boolean, nextInterval: number) => {
    setSaving(true);
    try {
      const saved = await upsertMaintenanceSchedule(db, {
        weapon_id: weaponId,
        enabled: nextEnabled,
        interval_rounds: nextInterval,
      });
      setSchedule(saved);
      bumpRefresh();
      await syncWeaponMaintenanceNotifications(db, t);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const onToggle = async (value: boolean) => {
    setEnabled(value);
    if (value) {
      await ensureNotificationPermissions();
    }
    await persist(value, interval);
  };

  const onIntervalChange = async (n: number) => {
    setInterval(n);
    if (enabled || schedule) {
      await persist(enabled, n);
    }
  };

  const markComplete = async () => {
    setSaving(true);
    try {
      if (!schedule) {
        await upsertMaintenanceSchedule(db, {
          weapon_id: weaponId,
          enabled: true,
          interval_rounds: interval,
        });
      }
      await completeWeaponMaintenance(db, weaponId);
      bumpRefresh();
      await load();
      await syncWeaponMaintenanceNotifications(db, t);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View>
      <SectionHeader title={t('maintenance.sectionTitle')} />
      <Card variant="brass">
        <View style={styles.cardInner}>
        <Text style={styles.hint}>{t('maintenance.intro')}</Text>
        <Text style={styles.meta}>{t('maintenance.ownedRounds', { count: ownedRounds })}</Text>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>{t('maintenance.enable')}</Text>
          <Switch
            value={enabled}
            onValueChange={onToggle}
            disabled={saving}
            trackColor={{ false: AppColors.border, true: AppColors.accentOlive }}
            thumbColor={enabled ? AppColors.accentBrass : AppColors.textMuted}
          />
        </View>

        <RoundsFiredPicker
          value={interval}
          onChange={onIntervalChange}
          onBrass
          labels={{ roundsFired: t('maintenance.interval'), custom: t('common.custom') }}
        />

        {enabled && progress ? (
          <Text
            style={[
              styles.status,
              progress.due ? styles.statusDue : styles.statusOk,
            ]}
          >
            {progress.due
              ? t('maintenance.due')
              : t('maintenance.untilDue', { count: progress.untilDue })}
          </Text>
        ) : null}

        <View style={styles.actions}>
          <SecondaryButton
            label={t('maintenance.markDone')}
            fullWidth
            onPress={markComplete}
            disabled={saving}
          />
        </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  cardInner: {
    padding: 14,
    gap: 10,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(13, 16, 13, 0.78)',
  },
  meta: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.textInverse,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textInverse,
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusOk: { color: AppColors.surface },
  statusDue: { color: AppColors.textInverse },
  actions: { marginTop: 4 },
});
