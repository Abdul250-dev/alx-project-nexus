
import * as React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface AspectRatioProps extends ViewProps {
  ratio?: number; // e.g., 16 / 9
  children?: React.ReactNode;
}

const AspectRatio = React.forwardRef<View, AspectRatioProps>(
  ({ ratio = 1, className, style, children, ...props }, ref) => {
    return (
      <View
        ref={ref}
        className={cn(className)}
        style={[{ aspectRatio: ratio }, style]} // Apply aspectRatio style
        {...props}
      >
        {/* The child element will be stretched/positioned within this View */}
        {/* Often used with an absolutely positioned child like an Image */}
        {children}
      </View>
    );
  }
);

AspectRatio.displayName = 'AspectRatio';

export { AspectRatio };

