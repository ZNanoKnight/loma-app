/**
 * Font utility for mapping font weights to VendSans font families
 */

export const getFontFamily = (weight?: string, italic?: boolean): string => {
  const isItalic = italic || false;

  switch (weight) {
    case 'bold':
    case '700':
      return isItalic ? 'VendSans-BoldItalic' : 'VendSans-Bold';

    case '600':
      return isItalic ? 'VendSans-SemiBoldItalic' : 'VendSans-SemiBold';

    case '500':
      return isItalic ? 'VendSans-MediumItalic' : 'VendSans-Medium';

    case '300':
      return isItalic ? 'VendSans-LightItalic' : 'VendSans-Light';

    case 'normal':
    case '400':
    default:
      return isItalic ? 'VendSans-Italic' : 'VendSans-Regular';
  }
};

// Font families for direct use
export const Fonts = {
  regular: 'VendSans-Regular',
  italic: 'VendSans-Italic',
  light: 'VendSans-Light',
  lightItalic: 'VendSans-LightItalic',
  medium: 'VendSans-Medium',
  mediumItalic: 'VendSans-MediumItalic',
  semiBold: 'VendSans-SemiBold',
  semiBoldItalic: 'VendSans-SemiBoldItalic',
  bold: 'VendSans-Bold',
  boldItalic: 'VendSans-BoldItalic',
};
