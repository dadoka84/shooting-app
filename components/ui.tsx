import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { View } from '@/components/Themed';

import { AppColors } from '@/constants/theme';
import type { ScoringStatus } from '@/lib/types';

export function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        pressed && !disabled && styles.btnPressed,
        disabled && styles.btnDisabled,
      ]}
    >
      <Text style={styles.btnText}>{label}</Text>
    </Pressable>
  );
}

export function LinkButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href as never} asChild>
      <Pressable style={({ pressed }) => [styles.linkBtn, pressed && styles.linkPressed]}>
        <Text style={styles.linkText}>{label}</Text>
      </Pressable>
    </Link>
  );
}

export function ScreenScroll({ children }: { children: React.ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

export type StatusTone = 'success' | 'warning' | 'neutral' | 'info';

export function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action != null ? <View style={styles.sectionAction}>{action}</View> : null}
    </View>
  );
}

export function StatusPill({ label, tone }: { label: string; tone: StatusTone }) {
  const pillStyle =
    tone === 'success'
      ? styles.pillSuccess
      : tone === 'warning'
        ? styles.pillWarning
        : tone === 'info'
          ? styles.pillInfo
          : styles.pillNeutral;
  const textStyle =
    tone === 'success'
      ? styles.pillTextSuccess
      : tone === 'warning'
        ? styles.pillTextWarning
        : tone === 'info'
          ? styles.pillTextInfo
          : styles.pillTextNeutral;

  return (
    <View style={[styles.pill, pillStyle]}>
      <Text style={[styles.pillText, textStyle]}>{label}</Text>
    </View>
  );
}

export function ListRow({
  title,
  subtitle,
  right,
  onPress,
  showChevron = true,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
}) {
  const content = (
    <View style={styles.listRowInner}>
      <View style={styles.listRowTextCol}>
        <Text style={styles.listRowTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.listRowSubtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.listRowRight}>
        {right}
        {showChevron ? <Text style={styles.chevron}>›</Text> : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.listRow, pressed && styles.listRowPressed]}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.listRow}>{content}</View>;
}

export function ListDivider() {
  return <View style={styles.listDivider} />;
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {hint ? <Text style={styles.emptyHint}>{hint}</Text> : null}
    </View>
  );
}

/** Maps DB scoring state to a short pill label + tone for list rows */
export function targetStatusDisplay(
  status: ScoringStatus,
  totalScore: number | null,
): { label: string; tone: StatusTone } {
  if (status === 'pending') {
    return { label: 'Pending', tone: 'neutral' };
  }
  if (status === 'confirmed') {
    const pts = totalScore != null ? `${totalScore} pts` : 'Confirmed';
    return { label: pts, tone: 'success' };
  }
  const pts = totalScore != null ? `${totalScore} pts` : 'Scored';
  return { label: pts, tone: 'info' };
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  btn: {
    backgroundColor: AppColors.accentOliveBright,
    borderWidth: 1,
    borderColor: AppColors.accentBrass,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnPressed: {
    backgroundColor: AppColors.accentOlive,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnText: {
    color: AppColors.textInverse,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  linkBtn: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  linkPressed: {
    opacity: 0.85,
  },
  linkText: {
    color: AppColors.accentBrass,
    fontWeight: '700',
  },
  card: {
    backgroundColor: AppColors.surfaceRaised,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: -4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: AppColors.textMuted,
  },
  sectionAction: {
    flexShrink: 0,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pillSuccess: {
    backgroundColor: AppColors.successMuted,
    borderColor: AppColors.successBorder,
  },
  pillWarning: {
    backgroundColor: AppColors.warningMuted,
    borderColor: AppColors.warningBorder,
  },
  pillNeutral: {
    backgroundColor: AppColors.neutralMuted,
    borderColor: AppColors.neutralBorder,
  },
  pillInfo: {
    backgroundColor: '#1e2830',
    borderColor: '#2a3d4a',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  pillTextSuccess: { color: AppColors.successText },
  pillTextWarning: { color: AppColors.warningText },
  pillTextNeutral: { color: AppColors.neutralText },
  pillTextInfo: { color: '#9ec4e0' },
  listRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  listRowPressed: {
    backgroundColor: AppColors.surface,
  },
  listRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  listRowTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  listRowTitle: {
    color: AppColors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  listRowSubtitle: {
    color: AppColors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  listRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chevron: {
    color: AppColors.textMuted,
    fontSize: 22,
    fontWeight: '300',
    marginTop: -2,
  },
  listDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: AppColors.borderSubtle,
    marginLeft: 14,
  },
  empty: {
    paddingVertical: 20,
    paddingHorizontal: 8,
    gap: 6,
  },
  emptyTitle: {
    color: AppColors.textMuted,
    fontSize: 15,
    textAlign: 'center',
  },
  emptyHint: {
    color: AppColors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.85,
  },
});
