/**
 * Font utility for mapping font weights to Quicksand font families
 * Note: Quicksand doesn't have italic variants, so italic parameter is ignored
 */

export const getFontFamily = (weight?: string, italic?: boolean): string => {
  switch (weight) {
    case 'bold':
    case '700':
      return 'Quicksand-Bold';

    case '600':
      return 'Quicksand-SemiBold';

    case '500':
      return 'Quicksand-Medium';

    case '300':
      return 'Quicksand-Light';

    case 'normal':
    case '400':
    default:
      return 'Quicksand-Regular';
  }
};

// Font families for direct use
export const Fonts = {
  regular: 'Quicksand-Regular',
  light: 'Quicksand-Light',
  medium: 'Quicksand-Medium',
  semiBold: 'Quicksand-SemiBold',
  bold: 'Quicksand-Bold',
};
