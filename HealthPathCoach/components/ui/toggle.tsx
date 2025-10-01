
import * as React from 'react';
import {
    Pressable,
    Text,
    StyleSheet,
    type PressableProps,
    type TextProps,
} from 'react-native';
import { cn } from '@/lib/utils';

// Base styles (simplified from toggleVariants)
const toggleBaseClass =
    'inline-flex items-center justify-center rounded-md text-sm font-medium';
const toggleSizeClasses = {
    default: 'h-10 px-3 min-w-10',
    sm: 'h-9 px-2.5 min-w-9',
    lg: 'h-11 px-5 min-w-11',
};
const toggleVariantClasses = {
    default: 'bg-transparent',
    outline: 'border border-input bg-transparent',
};
const toggleSelectedClasses = {
    default: 'bg-accent text-accent-foreground',
    outline: 'bg-accent text-accent-foreground',
};

interface ToggleProps extends PressableProps {
    variant?: 'default' | 'outline';
    size?: 'default' | 'sm' | 'lg';
    pressed?: boolean; // Use 'pressed' prop for controlled state
    onPressedChange?: (pressed: boolean) => void;
    defaultPressed?: boolean;
    children?: React.ReactNode;
}

const Toggle = React.forwardRef<React.ElementRef<typeof Pressable>, ToggleProps>(
    (
        {
            className,
            variant = 'default',
            size = 'default',
            pressed: controlledPressed,
            defaultPressed,
            onPressedChange,
            children,
            style,
            disabled,
            ...props
        },
        ref
    ) => {
        // Handle uncontrolled state
        const [uncontrolledPressed, setUncontrolledPressed] = React.useState(
            defaultPressed ?? false
        );
        const isControlled = controlledPressed !== undefined;
        const isPressed = isControlled ? controlledPressed : uncontrolledPressed;

        const handlePress = () => {
            const newState = !isPressed;
            if (!isControlled) {
                setUncontrolledPressed(newState);
            }
            onPressedChange?.(newState);
        };

        return (
            <Pressable
                ref={ref}
                onPress={handlePress}
                disabled={disabled}
                className={cn(
                    toggleBaseClass,
                    toggleSizeClasses[size],
                    toggleVariantClasses[variant],
                    isPressed && toggleSelectedClasses[variant],
                    disabled && 'opacity-50',
                    // Removed web-specific hover/focus/ring styles
                    className
                )}
                accessibilityState={{ selected: isPressed, disabled }}
                accessibilityRole="togglebutton"
                style={({ pressed: rnPressed }) => [
                    // Apply visual feedback for RN press state
                    rnPressed && { opacity: 0.8 },
                    typeof style === 'function' ? style({ pressed: rnPressed }) : style,
                ]}
                {...props}
            >
                {/* Wrap string children in Text, adjust color based on state */}
                {typeof children === 'string' ? (
                    <Text className={cn(isPressed ? 'text-accent-foreground' : 'text-foreground')}>
                        {children}
                    </Text>
                ) : (
                    children
                )}
            </Pressable>
        );
    }
);

Toggle.displayName = 'Toggle';

// Exporting toggleVariants might not be needed or would need adaptation
// if consumers were using it directly.
export { Toggle };

