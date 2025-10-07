import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from './ThemeProvider';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  style,
  textStyle,
  ...props
}) => {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    const baseStyle = {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: parseFloat(theme.borderRadius.lg),
      flexDirection: 'row',
    };

    // Size variants
    const sizeStyles = {
      sm: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        minHeight: 32,
      },
      md: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 44,
      },
      lg: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        minHeight: 52,
      },
    };

    // Color variants
    const colorStyles = {
      primary: {
        backgroundColor: theme.colors.brand.primary,
      },
      secondary: {
        backgroundColor: theme.colors.brand.secondary,
      },
      accent: {
        backgroundColor: theme.colors.brand.accent,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: theme.colors.brand.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return [
      baseStyle,
      sizeStyles[size],
      colorStyles[variant],
      disabled && { opacity: 0.5 },
      style,
    ];
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontFamily: theme.typography.fontFamily.primary,
      fontWeight: theme.typography.fontWeight.semibold,
    };

    // Size text variants
    const sizeTextStyles = {
      sm: {
        fontSize: parseFloat(theme.typography.fontSize.sm.replace('rem', '')) * 16,
      },
      md: {
        fontSize: parseFloat(theme.typography.fontSize.base.replace('rem', '')) * 16,
      },
      lg: {
        fontSize: parseFloat(theme.typography.fontSize.lg.replace('rem', '')) * 16,
      },
    };

    // Color text variants
    const colorTextStyles = {
      primary: {
        color: theme.colors.brand.text,
      },
      secondary: {
        color: theme.colors.brand.text,
      },
      accent: {
        color: theme.colors.light.background,
      },
      outline: {
        color: theme.colors.brand.primary,
      },
      ghost: {
        color: theme.colors.brand.primary,
      },
    };

    return [
      baseTextStyle,
      sizeTextStyles[size],
      colorTextStyles[variant],
      textStyle,
    ];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'accent' ? theme.colors.light.background : theme.colors.brand.text}
          style={{ marginRight: 8 }}
        />
      )}
      <Text style={getTextStyle()}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});