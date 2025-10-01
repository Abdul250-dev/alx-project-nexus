
import * as React from 'react';
import { Text, View, type ViewProps } from 'react-native';
import { cn } from '@/lib/utils'; // Assuming this utility handles class names for React Native

// Define base and variant styles directly (alternative to cva)
const badgeBaseClass =
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors';
// Removed focus states as they are less common/different in RN

const badgeVariantClasses = {
  default:
    'border-transparent bg-primary text-primary-foreground',
    // Removed hover state
  secondary:
    'border-transparent bg-secondary text-secondary-foreground',
    // Removed hover state
  destructive:
    'border-transparent bg-destructive text-destructive-foreground',
    // Removed hover state
  outline: 'text-foreground',
};

// Define types for variants
type BadgeVariant = keyof typeof badgeVariantClasses;

export interface BadgeProps extends ViewProps { // Use ViewProps
  variant?: BadgeVariant;
  children?: React.ReactNode; // Explicitly add children prop for Text content
}

function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const variantClass = badgeVariantClasses[variant] || badgeVariantClasses.default;

  // Determine text color class based on variant for the Text component
  let textColorClass = '';
  switch (variant) {
    case 'default':
      textColorClass = 'text-primary-foreground';
      break;
    case 'secondary':
      textColorClass = 'text-secondary-foreground';
      break;
    case 'destructive':
      textColorClass = 'text-destructive-foreground';
      break;
    case 'outline':
      textColorClass = 'text-foreground';
      break;
    default:
      textColorClass = 'text-primary-foreground';
  }

  return (
    <View
      className={cn(badgeBaseClass, variantClass, className)}
      {...props}
    >
      {/* Wrap children in a Text component and apply appropriate text color */}
      <Text className={cn('text-xs font-semibold', textColorClass)}>
        {children}
      </Text>
    </View>
  );
}

// Exporting badgeVariants might not be needed or would need adaptation
// if consumers were using it directly.
export { Badge };

