import * as React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface ProgressProps extends ViewProps {
  value?: number;
}

const Progress = React.forwardRef<View, ProgressProps>(
  ({ className, value = 0, style, ...props }, ref) => {
    // Ensure value is between 0 and 100
    const clampedValue = Math.max(0, Math.min(100, value));
    
    return (
      <View
        ref={ref}
        className={cn(
          'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
          className
        )}
        style={[style]}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: clampedValue }}
        {...props}
      >
        <View
          className="h-full bg-primary"
          style={{
            width: `${clampedValue}%`,
          }}
        />
      </View>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };
