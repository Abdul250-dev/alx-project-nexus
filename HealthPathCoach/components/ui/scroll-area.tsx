import * as React from 'react';
import { ScrollView, View, StyleSheet, type ViewProps, type ScrollViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface ScrollAreaProps extends ScrollViewProps {
  className?: string;
  children?: React.ReactNode;
}

const ScrollArea = React.forwardRef<ScrollView, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => (
    <View className={cn("relative overflow-hidden", className)}>
      <ScrollView
        ref={ref}
        className="h-full w-full"
        showsVerticalScrollIndicator={true}
        showsHorizontalScrollIndicator={false}
        {...props}
      >
        {children}
      </ScrollView>
    </View>
  )
);

ScrollArea.displayName = 'ScrollArea';

// ScrollBar is not needed in React Native as the native ScrollView handles scrollbars
// This is included as a no-op component for API compatibility
const ScrollBar = React.forwardRef<View, ViewProps & { orientation?: 'vertical' | 'horizontal' }>(
  ({ className, orientation = "vertical", ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "hidden", // Hide this component as it's not needed in RN
        className
      )}
      {...props}
    />
  )
);

ScrollBar.displayName = 'ScrollBar';

export { ScrollArea, ScrollBar };
