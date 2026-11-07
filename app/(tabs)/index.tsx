import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { TargetRowIcon } from '@/components/TargetRowIcon';
import { AppHeader } from '@/components/theme';
import {
  Card,
  EmptyState,
  ButtonRow,
  LinkButton,
  ListDivider,
  ListRow,
  PrimaryButton,
  ScreenScroll,
  SecondaryButton,
  SectionHeader,
  StatusPill,
  targetStatusDisplay,
} from '@/components/ui';
import { AppColors } from '@/constants/theme';
import { useDatabase } from '@/lib/db/DatabaseProvider';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { listMaintenanceDueWeapons } from '@/lib/db/maintenanceRepository';
import {
  getTotalRoundsFiredAllTime,
  recentTargets,
  recentTripsWithLocations,
  type RecentTripRow,
  type TargetListRow,
} from '@/lib/db/repository';
import type { MaintenanceDueRow } from '@/lib/db/maintenanceRepository';
import { syncWeaponMaintenanceNotifications } from '@/lib/maintenance/notifications';
import { isTripCompleted } from '@/lib/trips/status';

export default function HomeScreen() {
  const { db, refreshKey } = useDatabase();
  const router = useRouter();
  const { t } = useI18n();
  const [trips, setTrips] = useState<RecentTripRow[]>([]);
  const [targets, setTargets] = useState<TargetListRow[]>([]);
  const [allTimeRounds, setAllTimeRounds] = useState(0);
  const [maintenanceDue, setMaintenanceDue] = useState<MaintenanceDueRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setTrips(await recentTripsWithLocations(db, 5));
        setTargets(await recentTargets(db, 5));
        setAllTimeRounds(await getTotalRoundsFiredAllTime(db));
        setMaintenanceDue(await listMaintenanceDueWeapons(db));
        await syncWeaponMaintenanceNotifications(db, t);
      })();
    }, [db, refreshKey, t]),
  );

  return (
    <ScreenScroll>
      <AppHeader fullBleed allTimeShotsLabel={t('home.allTimeShots', { count: allTimeRounds })} />
      <Text style={styles.subtitle}>{t('home.subtitle')}</Text>

      <Card>
        <View style={styles.quickRow}>
          <ButtonRow layout="row">
            <PrimaryButton label={t('home.newTrip')} fullWidth onPress={() => router.push('/trip/new')} />
            <SecondaryButton
              label={t('home.browseTrips')}
              fullWidth
              onPress={() => router.push('/(tabs)/trips')}
            />
          </ButtonRow>
        </View>
      </Card>

      {maintenanceDue.length > 0 ? (
        <>
          <SectionHeader
            title={t('home.maintenanceDue')}
            action={<LinkButton href="/(tabs)/weapons" label={t('tabs.weapons')} />}
          />
          <Card variant="brass">
            {maintenanceDue.map((row, i) => (
              <View key={row.weapon_id}>
                <ListRow
                  onBrass
                  title={row.weapon_name}
                  subtitle={t('home.maintenanceRowSub', { count: row.rounds_since_service })}
                  onPress={() => router.push(`/weapon/${row.weapon_id}`)}
                  right={<StatusPill label={t('maintenance.badge')} tone="warning" />}
                />
                {i < maintenanceDue.length - 1 ? <ListDivider onBrass /> : null}
              </View>
            ))}
          </Card>
        </>
      ) : null}

      <SectionHeader title={t('home.recentTrips')} action={<LinkButton href="/(tabs)/trips" label={t('home.seeAll')} />} />
      <Card>
        {trips.length === 0 ? (
          <EmptyState title={t('home.noTrips')} hint={t('home.noTripsHint')} />
        ) : (
          trips.map((item, i) => (
            <View key={item.id}>
              <ListRow
                title={tripDisplayName(item)}
                subtitle={formatDateShort(item.started_at)}
                onPress={() => router.push(`/trip/${item.id}`)}
                right={
                  <StatusPill
                    label={isTripCompleted(item) ? t('home.completed') : t('home.inProgress')}
                    tone={isTripCompleted(item) ? 'success' : 'warning'}
                  />
                }
              />
              {i < trips.length - 1 ? <ListDivider /> : null}
            </View>
          ))
        )}
      </Card>

      <SectionHeader
        title={t('home.latestTargets')}
        action={<LinkButton href="/(tabs)/library" label={t('home.library')} />}
      />
      <Card>
        {targets.length === 0 ? (
          <EmptyState title={t('home.noTargets')} hint={t('home.noTargetsHint')} />
        ) : (
          targets.map((item, i) => {
            const st = targetStatusDisplay(item.scoring_status, item.total_score);
            return (
              <View key={item.id}>
                <ListRow
                  leading={<TargetRowIcon />}
                  title={formatDateShort(item.created_at)}
                  subtitle={t('library.rowSubTemplate', { template: formatTemplate(item.target_template, t) })}
                  onPress={() => router.push(`/target/${item.id}`)}
                  right={<StatusPill label={st.label} tone={st.tone} />}
                />
                {i < targets.length - 1 ? <ListDivider /> : null}
              </View>
            );
          })
        )}
      </Card>
    </ScreenScroll>
  );
}

function tripDisplayName(trip: RecentTripRow): string {
  return trip.location_name?.trim() || 'Unknown range';
}

function formatDateShort(ms: number): string {
  return new Date(ms).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatTemplate(id: string, t: ReturnType<typeof useI18n>['t']): string {
  if (id === 'baker_sl_b27e_v1') return t('template.b27');
  return id.replace(/_/g, ' ');
}

const styles = StyleSheet.create({
  subtitle: { color: AppColors.textMuted, marginBottom: 8, fontSize: 14 },
  quickRow: { padding: 12 },
});
