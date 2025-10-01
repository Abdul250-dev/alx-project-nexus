
import * as React from 'react';
import {
    View,
    Pressable,
    Text,
    StyleSheet,
    type ViewProps,
    type PressableProps,
} from 'react-native';
import { cn } from '@/lib/utils';

// Context to manage toggle group state
interface ToggleGroupContextProps {
    value: string | string[] | undefined;
    onValueChange: (value: string) => void;
    type: 'single' | 'multiple';
    variant?: 'default' | 'outline'; // Simplified variants
    size?: 'default' | 'sm' | 'lg'; // Simplified sizes
}

const ToggleGroupContext = React.createContext<ToggleGroupContextProps | null>(null);

const useToggleGroupContext = () => {
    const context = React.useContext(ToggleGroupContext);
    if (!context) {
        throw new Error('ToggleGroupItem must be used within a ToggleGroup');
    }
    return context;
};

// Base styles (simplified from toggleVariants)
const toggleBaseClass =
    'inline-flex items-center justify-center rounded-md text-sm font-medium';
const toggleSizeClasses = {
    default: 'h-10 px-3',
    sm: 'h-9 px-2.5',
    lg: 'h-11 px-5',
};
const toggleVariantClasses = {
    default: 'bg-transparent',
    outline: 'border border-input bg-transparent',
};
const toggleSelectedClasses = {
    default: 'bg-accent text-accent-foreground',
    outline: 'bg-accent text-accent-foreground',
};

// ToggleGroup Root component (provides context)
interface ToggleGroupProps extends ViewProps {
    variant?: 'default' | 'outline';
    size?: 'default' | 'sm' | 'lg';
    children: React.ReactNode;
    type?: 'single' | 'multiple';
    value?: string | string[];
    onValueChange?: (value: string | string[]) => void;
    defaultValue?: string | string[];
    // Add disabled, orientation, loop etc. if needed
}

const ToggleGroup = React.forwardRef<View, ToggleGroupProps>(
    (
        {
            className,
            variant = 'default',
            size = 'default',
            children,
            type = 'single',
            value: controlledValue,
            defaultValue,
            onValueChange,
            ...props
        },
        ref
    ) => {
        // Handle uncontrolled state
        const [uncontrolledValue, setUncontrolledValue] = React.useState<
            string | string[] | undefined
        >(defaultValue);
        const isControlled = controlledValue !== undefined;
        const value = isControlled ? controlledValue : uncontrolledValue;

        const handleValueChange = (itemValue: string) => {
            let newValue: string | string[] | undefined;
            if (type === 'single') {
                newValue = value === itemValue ? undefined : itemValue;
            } else {
                const currentValueArray = Array.isArray(value) ? value : (value ? [value] : []);
                if (currentValueArray.includes(itemValue)) {
                    newValue = currentValueArray.filter((v) => v !== itemValue);
                } else {
                    newValue = [...currentValueArray, itemValue];
                }
            }

            if (!isControlled) {
                setUncontrolledValue(newValue);
            }
            onValueChange?.(newValue as any); // Type assertion might be needed
        };

        return (
            <ToggleGroupContext.Provider
                value={{ value, onValueChange: handleValueChange, type, variant, size }}
            >
                <View
                    ref={ref}
                    className={cn('flex flex-row items-center justify-center gap-1', className)}
                    role={type === 'single' ? 'radiogroup' : 'group'}
                    {...props}
                >
                    {children}
                </View>
            </ToggleGroupContext.Provider>
        );
    }
);
ToggleGroup.displayName = 'ToggleGroup';

// ToggleGroup Item component (Pressable)
interface ToggleGroupItemProps extends PressableProps {
    value: string;
    children: React.ReactNode;
    // variant/size props are inherited from context by default
    variant?: 'default' | 'outline';
    size?: 'default' | 'sm' | 'lg';
}

const ToggleGroupItem = React.forwardRef<React.ElementRef<typeof Pressable>, ToggleGroupItemProps>(
    ({ className, children, variant, size, value, style, ...props }, ref) => {
        const context = useToggleGroupContext();
        const itemVariant = variant ?? context.variant ?? 'default';
        const itemSize = size ?? context.size ?? 'default';

        const isSelected =
            context.type === 'single'
                ? context.value === value
                : Array.isArray(context.value) && context.value.includes(value);

        return (
            <Pressable
                ref={ref}
                onPress={() => context.onValueChange(value)}
                className={cn(
                    toggleBaseClass,
                    toggleSizeClasses[itemSize],
                    toggleVariantClasses[itemVariant],
                    isSelected && toggleSelectedClasses[itemVariant],
                    props.disabled && 'opacity-50',
                    // Removed web-specific hover/focus styles
                    className
                )}
                accessibilityState={{ selected: isSelected, disabled: props.disabled }}
                accessibilityRole={context.type === 'single' ? 'radio' : 'checkbox'}
                style={({ pressed }) => [
                    pressed && { opacity: 0.8 },
                    typeof style === 'function' ? style({ pressed }) : style,
                ]}
                {...props}
            >
                {/* Wrap string children in Text */}
                {typeof children === 'string' ? <Text className={cn(isSelected ? 'text-accent-foreground' : 'text-foreground')}>{children}</Text> : children}
            </Pressable>
        );
    }
);
ToggleGroupItem.displayName = 'ToggleGroupItem';

export { ToggleGroup, ToggleGroupItem };

