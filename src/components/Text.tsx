import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';

interface CustomTextProps extends TextProps {
  bold?: boolean;
  semiBold?: boolean;
  medium?: boolean;
  light?: boolean;
}

export default function Text({ style, bold, semiBold, medium, light, ...props }: CustomTextProps) {
  let fontFamily = 'Quicksand-Regular';
  
  if (bold) fontFamily = 'Quicksand-Bold';
  else if (semiBold) fontFamily = 'Quicksand-SemiBold';
  else if (medium) fontFamily = 'Quicksand-Medium';
  else if (light) fontFamily = 'Quicksand-Light';
  
  // Handle fontWeight from styles (simplified)
  if (!bold && !semiBold && !medium && !light && style) {
    const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
    if (flatStyle && typeof flatStyle === 'object' && 'fontWeight' in flatStyle) {
      const weight = (flatStyle as TextStyle).fontWeight;
      if (weight === 'bold' || weight === '700') fontFamily = 'Quicksand-Bold';
      else if (weight === '600') fontFamily = 'Quicksand-SemiBold';
      else if (weight === '500') fontFamily = 'Quicksand-Medium';
      else if (weight === '300') fontFamily = 'Quicksand-Light';
    }
  }
  
  return (
    <RNText {...props} style={[{ fontFamily }, style]} />
  );
}