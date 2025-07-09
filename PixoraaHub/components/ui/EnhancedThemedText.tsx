import React from 'react';
import { Text, type TextProps } from 'react-native';
import { Colors, Typography } from '../../constants/Colors';
import { useThemeColor } from '../../hooks/useThemeColor';

export type EnhancedThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | 'heading1'
    | 'heading2'
    | 'heading3'
    | 'heading4'
    | 'body'
    | 'bodyMedium'
    | 'bodySemiBold'
    | 'caption'
    | 'captionMedium'
    | 'small'
    | 'smallMedium';
  color?:
    | 'default'
    | 'secondary'
    | 'muted'
    | 'inverse'
    | 'primary'
    | 'success'
    | 'warning'
    | 'error';
};

export const EnhancedThemedText: React.FC<EnhancedThemedTextProps> = ({
  style,
  lightColor,
  darkColor,
  type = 'body',
  color = 'default',
  ...rest
}) => {
  const getTextColor = () => {
    if (lightColor || darkColor) {
      return useThemeColor({ light: lightColor, dark: darkColor }, 'text');
    }

    switch (color) {
      case 'secondary':
        return useThemeColor(
          {
            light: Colors.light.textSecondary,
            dark: Colors.dark.textSecondary,
          },
          'text'
        );
      case 'muted':
        return useThemeColor(
          { light: Colors.light.textMuted, dark: Colors.dark.textMuted },
          'text'
        );
      case 'inverse':
        return useThemeColor(
          { light: Colors.light.textInverse, dark: Colors.dark.textInverse },
          'text'
        );
      case 'primary':
        return useThemeColor(
          { light: Colors.light.primary, dark: Colors.dark.primary },
          'text'
        );
      case 'success':
        return useThemeColor(
          { light: Colors.light.success, dark: Colors.dark.success },
          'text'
        );
      case 'warning':
        return useThemeColor(
          { light: Colors.light.warning, dark: Colors.dark.warning },
          'text'
        );
      case 'error':
        return useThemeColor(
          { light: Colors.light.error, dark: Colors.dark.error },
          'text'
        );
      default:
        return useThemeColor({}, 'text');
    }
  };

  const textColor = getTextColor();
  const typographyStyle = Typography[type];

  return (
    <Text style={[{ color: textColor }, typographyStyle, style]} {...rest} />
  );
};
