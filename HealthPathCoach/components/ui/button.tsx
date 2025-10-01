
import * as React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  type PressableProps,
  type TextProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { cn } from '@/lib/utils'; // Assuming this utility handles class names for React Native

// Define base and variant styles directly (alternative to cva)
const buttonBaseClass =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors';
// Removed web-specific focus, ring, disabled pointer-events

const buttonVariantClasses = {
  default:
    'bg-primary text-primary-foreground',
    // Removed hover state
  destructive:
    'bg-destructive text-destructive-foreground',
    // Removed hover state
  outline:
    'border border-input bg-background',
    // Removed hover state
  secondary:
    'bg-secondary text-secondary-foreground',
    // Removed hover state
  ghost: '', // Base styles apply, hover removed
  link: 'text-primary underline', // Simplified link style
};

const buttonSizeClasses = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
};

// Define types for variants and sizes
type ButtonVariant = keyof typeof buttonVariantClasses;
type ButtonSize = keyof typeof buttonSizeClasses;

// Helper to get text color class based on variant
const getTextColorClass = (variant: ButtonVariant): string => {
  switch (variant) {
    case 'default':
      return 'text-primary-foreground';
    case 'destructive':
      return 'text-destructive-foreground';
    case 'secondary':
      return 'text-secondary-foreground';
    case 'link':
      return 'text-primary';
    case 'outline':
    case 'ghost':
    default:
      return 'text-foreground'; // Default text color for outline/ghost
  }
};

export interface ButtonProps extends PressableProps { // Use PressableProps
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: React.ReactNode;
  textClassName?: string; // Allow passing specific class to inner Text
  // asChild prop is removed as Slot functionality is not directly replicated
}

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  ({ className, variant = 'default', size = 'default', children, textClassName, style, disabled, ...props }, ref) => {
    const variantClass = buttonVariantClasses[variant] || buttonVariantClasses.default;
    const sizeClass = buttonSizeClasses[size] || buttonSizeClasses.default;
    const textColorClass = getTextColorClass(variant);

    return (
      <Pressable
        className={cn(buttonBaseClass, variantClass, sizeClass, className)}
        ref={ref}
        disabled={disabled}
        style={({ pressed }) => [
            // Apply opacity when pressed or disabled
            (pressed || disabled) && { opacity: 0.7 },
            // Allow passing custom style prop
            typeof style === 'function' ? style({ pressed }) : style,
        ]}
        {...props}
      >
        {/* Wrap children in Text, applying appropriate text styles */}
        {typeof children === 'string' ? (
          <Text className={cn('text-sm font-medium', textColorClass, textClassName)}>
            {children}
          </Text>
        ) : (
          children // Allow passing icons or other components directly
        )}
      </Pressable>
    );
  }
);
Button.displayName = 'Button';

// Exporting buttonVariants might not be needed or would need adaptation
export { Button };

