import * as React from 'react';
import { View, PanResponder, StyleSheet, type ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface SliderProps extends ViewProps {
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  value?: number[];
  onValueChange?: (value: number[]) => void;
  disabled?: boolean;
}

const Slider = React.forwardRef<View, SliderProps>(
  ({ 
    className, 
    defaultValue = [0], 
    min = 0, 
    max = 100, 
    step = 1,
    value: controlledValue,
    onValueChange,
    disabled = false,
    ...props 
  }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;
    
    const trackRef = React.useRef<View>(null);
    const [trackWidth, setTrackWidth] = React.useState(0);
    const [trackLayout, setTrackLayout] = React.useState({ x: 0, width: 0 });
    
    // Calculate percentage for positioning
    const percentage = React.useMemo(() => {
      const val = value[0];
      return ((val - min) / (max - min)) * 100;
    }, [value, min, max]);
    
    // Handle value change
    const handleValueChange = React.useCallback((newValue: number) => {
      // Clamp value between min and max
      const clampedValue = Math.max(min, Math.min(max, newValue));
      
      // Apply step if provided
      const steppedValue = step > 0 
        ? Math.round(clampedValue / step) * step 
        : clampedValue;
      
      const newValueArray = [steppedValue];
      
      if (!isControlled) {
        setUncontrolledValue(newValueArray);
      }
      
      onValueChange?.(newValueArray);
    }, [min, max, step, isControlled, onValueChange]);
    
    // Set up PanResponder for thumb dragging
    const panResponder = React.useMemo(() => {
      if (disabled) return PanResponder.create({});
      
      return PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          if (trackLayout.width <= 0) return;
          
          const newX = gestureState.moveX - trackLayout.x;
          const percentage = Math.max(0, Math.min(1, newX / trackLayout.width));
          const newValue = min + percentage * (max - min);
          
          handleValueChange(newValue);
        },
      });
    }, [disabled, trackLayout, min, max, handleValueChange]);
    
    // Measure track dimensions
    const onTrackLayout = React.useCallback(() => {
      if (trackRef.current) {
        trackRef.current.measure((x, y, width, height, pageX) => {
          setTrackLayout({ x: pageX, width });
        });
      }
    }, []);
    
    return (
      <View
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          disabled && "opacity-50",
          className
        )}
        {...props}
      >
        <View 
          ref={trackRef}
          onLayout={onTrackLayout}
          className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary"
        >
          <View 
            className="absolute h-full bg-primary" 
            style={{ width: `${percentage}%` }}
          />
        </View>
        
        <View
          {...panResponder.panHandlers}
          className="absolute block h-5 w-5 rounded-full border-2 border-primary bg-background"
          style={{ 
            left: `${percentage}%`, 
            transform: [{ translateX: -10 }], // Half of thumb width (20/2)
          }}
          accessibilityRole="adjustable"
          accessibilityValue={{
            min,
            max,
            now: value[0],
          }}
        />
      </View>
    );
  }
);

Slider.displayName = 'Slider';

export { Slider };
