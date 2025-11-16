import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';

interface CustomTextProps extends TextProps {
  bold?: boolean;
  semiBold?: boolean;
  medium?: boolean;
  light?: boolean;
}

export default function Text({ style, bold, semiBold, medium, light, ...props }: CustomTextProps) {
  let fontFamily = 'VendSans-Regular';
  
  if (bold) fontFamily = 'VendSans-Bold';
  else if (semiBold) fontFamily = 'VendSans-SemiBold';
  else if (medium) fontFamily = 'VendSans-Medium';
  else if (light) fontFamily = 'VendSans-Light';
  
  // Handle fontWeight from styles (simplified)
  if (!bold && !semiBold && !medium && !light && style) {
    const flatStyle = Array.isArray(style) ? Object.assign({}, ...style) : style;
    if (flatStyle && typeof flatStyle === 'object' && 'fontWeight' in flatStyle) {
      const weight = (flatStyle as TextStyle).fontWeight;
      if (weight === 'bold' || weight === '700') fontFamily = 'VendSans-Bold';
      else if (weight === '600') fontFamily = 'VendSans-SemiBold';
      else if (weight === '500') fontFamily = 'VendSans-Medium';
      else if (weight === '300') fontFamily = 'VendSans-Light';
    }
  }
  
  return (
    <RNText {...props} style={[{ fontFamily }, style]} />
  );
}