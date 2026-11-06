import { TextInput, type TextInputProps } from 'react-native';

import { AppColors } from '@/constants/theme';

/** Dark-field text input matching WhatShotz theme (React Native TextInput ignores CSS). */
export function ThemedTextInput(props: TextInputProps) {
  const { style, placeholderTextColor, ...rest } = props;
  return (
    <TextInput
      placeholderTextColor={placeholderTextColor ?? AppColors.textMuted}
      style={[
        {
          borderWidth: 1,
          borderColor: AppColors.border,
          borderRadius: 8,
          padding: 10,
          marginTop: 4,
          backgroundColor: AppColors.surfaceRaised,
          color: AppColors.textPrimary,
        },
        style,
      ]}
      {...rest}
    />
  );
}
