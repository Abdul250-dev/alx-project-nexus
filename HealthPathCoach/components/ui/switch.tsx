import * as React from 'react';
import { Pressable, View, Animated, type ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface SwitchProps extends ViewProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch = React.forwardRef<View, SwitchProps>(
  ({ className, checked: controlledChecked, defaultChecked = false, onCheckedChange, disabled = false, ...props }, ref) => {
    // Handle controlled/uncontrolled state
    const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked);
    const isControlled = controlledChecked !== undefined;
    const isChecked = isControlled ? controlledChecked : uncontrolledChecked;
    
    // Animation value for thumb position
    const thumbPosition = React.useRef(new Animated.Value(isChecked ? 1 : 0)).current;
    
    // Update animation when checked state changes
    React.useEffect(() => {
      Animated.timing(thumbPosition, {
        toValue: isChecked ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, [isChecked, thumbPosition]);
    
    // Handle press
    const handlePress = React.useCallback(() => {
      if (disabled) return;
      
      const newChecked = !isChecked;
      if (!isControlled) {
        setUncontrolledChecked(newChecked);
      }
      onCheckedChange?.(newChecked);
    }, [isChecked, isControlled, onCheckedChange, disabled]);
    
    // Calculate thumb position based on animation value
    const translateX = thumbPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 20], // 5px movement (width of switch - width of thumb)
    });
    
    return (
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityState={{ checked: isChecked, disabled }}
      >
        <View
          ref={ref}
          className={cn(
            "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors",
            isChecked ? "bg-primary" : "bg-input",
            disabled && "opacity-50",
            className
          )}
          {...props}
        >
          <Animated.View
            className={cn(
              "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg"
            )}
            style={{
              transform: [{ translateX }],
            }}
          />
        </View>
      </Pressable>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };
