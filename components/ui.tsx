import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { View } from '@/components/Themed';

import { AppColors } from '@/constants/theme';

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
});
