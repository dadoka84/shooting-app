import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/theme';
import type { ScoringStatus } from '@/lib/types';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  label,
  onPress,
  disabled,
  variant = 'primary',
  fullWidth,
  style,
}: AppButtonProps) {
  const boxStyle =
    variant === 'secondary'
      ? styles.btnSecondary
      : variant === 'outline'
        ? styles.btnOutline
        : variant === 'danger'
          ? styles.btnDanger
          : styles.btnPrimary;
  const textStyle =
    variant === 'secondary'
      ? styles.btnTextSecondary
      : variant === 'outline'
        ? styles.btnTextOutline
        : variant === 'danger'
          ? styles.btnTextDanger
          : styles.btnTextPrimary;
  const pressedStyle =
    variant === 'secondary'
      ? styles.btnSecondaryPressed
      : variant === 'outline'
        ? styles.btnOutlinePressed
        : variant === 'danger'
          ? styles.btnDangerPressed
          : styles.btnPrimaryPressed;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btnBase,
        boxStyle,
        fullWidth && styles.btnFullWidth,
        pressed && !disabled && pressedStyle,
        disabled && styles.btnDisabled,
        style,
      ]}
    >
      <Text style={[styles.btnTextBase, textStyle]}>{label}</Text>
    </Pressable>
  );
}

export function PrimaryButton(props: Omit<AppButtonProps, 'variant'>) {
  return <AppButton {...props} variant="primary" />;
}

export function SecondaryButton(props: Omit<AppButtonProps, 'variant'>) {
  return <AppButton {...props} variant="secondary" />;
}

export function OutlineButton(props: Omit<AppButtonProps, 'variant'>) {
  return <AppButton {...props} variant="outline" />;
}

export function DangerButton(props: Omit<AppButtonProps, 'variant'>) {
  return <AppButton {...props} variant="danger" />;
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

export function ScreenScroll({
  children,
  contentContainerStyle,
}: {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.screen, contentContainerStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Short lead copy under the nav title on tab screens */
export function ScreenIntro({ description, title }: { description: string; title?: string }) {
  return (
    <View style={styles.intro}>
      {title ? <Text style={styles.introTitle}>{title}</Text> : null}
      <Text style={styles.introDescription}>{description}</Text>
    </View>
  );
}

/** Group primary / secondary / outline actions with consistent spacing */
export function ButtonRow({
  children,
  layout = 'stack',
}: {
  children: ReactNode;
  layout?: 'stack' | 'row';
}) {
  return <View style={layout === 'row' ? styles.buttonRow : styles.buttonStack}>{children}</View>;
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
      <Text style={[styles.pillText, textStyle]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function ListRow({
  title,
  subtitle,
  leading,
  right,
  onPress,
  showChevron = true,
}: {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
}) {
  const content = (
    <View style={styles.listRowInner}>
      {leading != null ? <View style={styles.listRowLeading}>{leading}</View> : null}
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
  safe: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scroll: {
    flex: 1,
  },
  screen: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 14,
  },
  intro: {
    gap: 6,
    marginBottom: 2,
  },
  introTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  introDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: AppColors.textMuted,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  buttonStack: {
    gap: 10,
  },
  btnBase: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  btnFullWidth: {
    alignSelf: 'stretch',
  },
  btnPrimary: {
    backgroundColor: AppColors.accentOliveBright,
    borderColor: AppColors.accentBrass,
  },
  btnPrimaryPressed: {
    backgroundColor: AppColors.accentOlive,
  },
  btnTextPrimary: {
    color: AppColors.textInverse,
  },
  btnSecondary: {
    backgroundColor: AppColors.surfaceRaised,
    borderColor: AppColors.border,
  },
  btnSecondaryPressed: {
    backgroundColor: AppColors.surface,
  },
  btnTextSecondary: {
    color: AppColors.accentBrass,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderColor: AppColors.accentBrassDim,
  },
  btnOutlinePressed: {
    backgroundColor: AppColors.surface,
  },
  btnTextOutline: {
    color: AppColors.textPrimary,
  },
  btnDanger: {
    backgroundColor: 'rgba(196, 92, 74, 0.18)',
    borderColor: AppColors.accentDanger,
  },
  btnDangerPressed: {
    backgroundColor: 'rgba(196, 92, 74, 0.32)',
  },
  btnTextDanger: {
    color: '#f0b5a8',
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnTextBase: {
    fontWeight: '700',
    letterSpacing: 0.4,
    fontSize: 15,
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
    /** subtle lift vs page so cards read as panels even on similar hues */
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: AppColors.textMuted,
  },
  sectionAction: {
    flexShrink: 0,
    maxWidth: '52%',
    alignItems: 'flex-end',
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'center',
    maxWidth: 120,
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
    fontSize: 11,
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
    width: '100%',
  },
  listRowLeading: {
    flexShrink: 0,
  },
  listRowTextCol: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    gap: 4,
    paddingRight: 4,
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
    gap: 6,
    flexShrink: 0,
    flexGrow: 0,
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
