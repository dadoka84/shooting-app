import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppColors } from '@/constants/theme';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { Locale } from '@/lib/i18n/strings';

type Props = {
  eventCountsByDay: Map<string, number>;
  selectedDateKey: string | null;
  onSelectDateKey: (key: string | null) => void;
};

const WEEKDAY_ORDER: Record<Locale, number[]> = {
  en: [0, 1, 2, 3, 4, 5, 6],
  bs: [1, 2, 3, 4, 5, 6, 0],
  de: [1, 2, 3, 4, 5, 6, 0],
};

function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

export function TripMonthCalendar({ eventCountsByDay, selectedDateKey, onSelectDateKey }: Props) {
  const { locale, t } = useI18n();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const monthLabel = useMemo(
    () =>
      new Date(viewYear, viewMonth, 1).toLocaleDateString(locale, {
        month: 'long',
        year: 'numeric',
      }),
    [viewMonth, viewYear, locale],
  );

  const weekdayLabels = useMemo(() => {
    const order = WEEKDAY_ORDER[locale];
    const base = new Date(2024, 0, 7);
    return order.map((dow) => {
      const d = new Date(base);
      d.setDate(base.getDate() + dow);
      return d.toLocaleDateString(locale, { weekday: 'narrow' });
    });
  }, [locale]);

  const cells = useMemo(() => {
    const first = startOfMonth(viewYear, viewMonth);
    const startDow = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const leading = startDow;
    const totalCells = Math.ceil((leading + daysInMonth) / 7) * 7;
    const result: { key: string; day: number | null; inMonth: boolean }[] = [];

    for (let i = 0; i < totalCells; i++) {
      const dayNum = i - leading + 1;
      if (dayNum < 1 || dayNum > daysInMonth) {
        result.push({ key: `pad-${i}`, day: null, inMonth: false });
      } else {
        const m = String(viewMonth + 1).padStart(2, '0');
        const d = String(dayNum).padStart(2, '0');
        result.push({
          key: `${viewYear}-${m}-${d}`,
          day: dayNum,
          inMonth: true,
        });
      }
    }
    return result;
  }, [viewMonth, viewYear]);

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={goPrev} hitSlop={10} style={styles.navBtn} accessibilityRole="button">
          <Text style={styles.navText}>‹</Text>
        </Pressable>
        <Text style={styles.monthTitle}>{monthLabel}</Text>
        <Pressable onPress={goNext} hitSlop={10} style={styles.navBtn} accessibilityRole="button">
          <Text style={styles.navText}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {weekdayLabels.map((label, i) => (
          <Text key={`wd-${i}`} style={styles.weekday}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell) => {
          if (!cell.inMonth || cell.day == null) {
            return <View key={cell.key} style={styles.cellPad} />;
          }
          const count = eventCountsByDay.get(cell.key) ?? 0;
          const selected = selectedDateKey === cell.key;
          const isToday = cell.key === todayKey;
          return (
            <Pressable
              key={cell.key}
              onPress={() => {
                if (selected) {
                  onSelectDateKey(null);
                } else {
                  onSelectDateKey(cell.key);
                }
              }}
              style={({ pressed }) => [
                styles.cell,
                selected && styles.cellSelected,
                isToday && !selected && styles.cellToday,
                pressed && styles.cellPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={
                count > 0
                  ? `${cell.day}, ${t('trips.calendarTripsCount', { count })}`
                  : String(cell.day)
              }
            >
              <Text style={[styles.dayNum, selected && styles.dayNumSelected]}>{cell.day}</Text>
              {count > 0 ? (
                <View style={styles.dotRow}>
                  <View style={[styles.dot, selected && styles.dotSelected]} />
                  {count > 1 ? <Text style={styles.dotCount}>{count > 9 ? '9+' : count}</Text> : null}
                </View>
              ) : (
                <View style={styles.dotSpacer} />
              )}
            </Pressable>
          );
        })}
      </View>

      {selectedDateKey ? (
        <Pressable onPress={() => onSelectDateKey(null)} style={styles.clearRow}>
          <Text style={styles.clearText}>{t('trips.clearDateFilter')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: AppColors.surfaceRaised,
    borderWidth: 1,
    borderColor: AppColors.borderSubtle,
  },
  navText: {
    color: AppColors.accentBrass,
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '600',
  },
  monthTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    color: AppColors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cellPad: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingVertical: 4,
  },
  cellSelected: {
    backgroundColor: AppColors.accentOlive,
    borderWidth: 1,
    borderColor: AppColors.accentBrassDim,
  },
  cellToday: {
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  cellPressed: {
    opacity: 0.85,
  },
  dayNum: {
    color: AppColors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  dayNumSelected: {
    color: AppColors.accentBrass,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
    minHeight: 10,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: AppColors.accentBrass,
  },
  dotSelected: {
    backgroundColor: AppColors.textPrimary,
  },
  dotCount: {
    color: AppColors.textMuted,
    fontSize: 8,
    fontWeight: '700',
  },
  dotSpacer: {
    height: 10,
    marginTop: 2,
  },
  clearRow: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  clearText: {
    color: AppColors.accentBrass,
    fontSize: 13,
    fontWeight: '600',
  },
});
