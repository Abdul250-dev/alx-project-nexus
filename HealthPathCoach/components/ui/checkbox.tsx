
import * as React from 'react';
import {
    Pressable,
    View,
    StyleSheet,
    type PressableProps,
} from 'react-native';
import { Check } from 'lucide-react-native'; // Use RN version
import { cn } from '@/lib/utils'; // Assuming this utility handles class names for React Native

interface CheckboxProps extends Omit<PressableProps, 'onPress'> {
    checked: boolean | 'indeterminate'; // Support boolean or indeterminate state
    onCheckedChange: (checked: boolean) => void;
    // Add other props like disabled, etc.
}

const Checkbox = React.forwardRef<
    React.ElementRef<typeof Pressable>,
    CheckboxProps
>(({ className, checked, onCheckedChange, disabled, ...props }, ref) => {

    const handlePress = () => {
        if (onCheckedChange) {
            // Toggle boolean state, indeterminate state needs external logic to resolve
            onCheckedChange(typeof checked === 'boolean' ? !checked : true);
        }
    };

    return (
        <Pressable
            ref={ref}
            onPress={handlePress}
            disabled={disabled}
            className={cn(
                'h-4 w-4 shrink-0 rounded-sm border border-primary',
                // Removed web-specific focus, ring, peer
                disabled && 'opacity-50', // Apply opacity if disabled
                // Apply background and text color based on state
                checked === true && 'bg-primary border-primary',
                className
            )}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: checked === 'indeterminate' ? 'mixed' : checked, disabled }}
            {...props}
        >
            {/* Render Check icon if checked is true */}
            {checked === true && (
                <View className={cn('flex items-center justify-center h-full w-full')}>
                    <Check className="h-3 w-3" strokeWidth={3} color="#FFFFFF" /> {/* Assuming primary-foreground is white */}
                </View>
            )}
            {/* Optionally render something for indeterminate state */}
            {/* {checked === 'indeterminate' && <MinusIcon />} */}
        </Pressable>
    );
});

Checkbox.displayName = 'Checkbox';

export { Checkbox };

