
import * as React from 'react';
import { Text, type TextProps } from 'react-native';
import { cn } from '@/lib/utils';

// Base styles from cva
const labelBaseClass =
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70';
// Note: peer-disabled styles require specific setup in NativeWind or manual handling

const Label = React.forwardRef<Text, TextProps>(
  ({ className, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn(labelBaseClass, className)}
      // Removed htmlFor prop, linking is done via nativeID/accessibilityLabelledBy on input
      {...props}
    />
  )
);
Label.displayName = 'Label'; // Keep a display name

export { Label };

