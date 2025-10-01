
import * as React from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    type ViewProps,
    type PressableProps,
} from 'react-native';
import { Circle } from 'lucide-react-native'; // Use RN icon
import { cn } from '@/lib/utils';

// Context to manage radio group state
interface RadioGroupContextProps {
    value: string | undefined;
    onValueChange: (value: string) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextProps | null>(null);

const useRadioGroupContext = () => {
    const context = React.useContext(RadioGroupContext);
    if (!context) {
        throw new Error('RadioGroupItem must be used within a RadioGroup');
    }
    return context;
};

// RadioGroup Root component (provides context)
interface RadioGroupProps extends ViewProps {
    value?: string;
    onValueChange?: (value: string) => void;
    defaultValue?: string;
    // Add other props like disabled, required, name, orientation, dir, loop
}

const RadioGroup = React.forwardRef<View, RadioGroupProps>(
    (
        {
            className,
            value: controlledValue,
            defaultValue,
            onValueChange,
            children,
            ...props
        },
        ref
    ) => {
        // Handle uncontrolled state
        const [uncontrolledValue, setUncontrolledValue] = React.useState<string | undefined>(
            defaultValue
        );
        const isControlled = controlledValue !== undefined;
        const currentValue = isControlled ? controlledValue : uncontrolledValue;

        const handleValueChange = (newValue: string) => {
            if (!isControlled) {
                setUncontrolledValue(newValue);
            }
            onValueChange?.(newValue);
        };

        return (
            <RadioGroupContext.Provider
                value={{ value: currentValue, onValueChange: handleValueChange }}
            >
                <View
                    ref={ref}
                    className={cn('grid gap-2', className)} // Keep basic layout class
                    accessibilityRole="radiogroup"
                    {...props}
                >
                    {children}
                </View>
            </RadioGroupContext.Provider>
        );
    }
);
RadioGroup.displayName = 'RadioGroup';

// RadioGroup Item component (Pressable circle)
interface RadioGroupItemProps extends PressableProps {
    value: string;
    // Add id, disabled, required from original if needed
}

const RadioGroupItem = React.forwardRef<React.ElementRef<typeof Pressable>, RadioGroupItemProps>(
    ({ className, value, disabled, ...props }, ref) => {
        const { value: selectedValue, onValueChange } = useRadioGroupContext();
        const isSelected = selectedValue === value;

        return (
            <Pressable
                ref={ref}
                onPress={() => onValueChange(value)}
                disabled={disabled}
                className={cn(
                    'aspect-square h-4 w-4 rounded-full border border-primary text-primary',
                    // Removed web-specific ring, focus styles
                    disabled && 'opacity-50',
                    className
                )}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected, disabled }}
                {...props}
            >
                {/* Indicator View */}
                {isSelected && (
                    <View className="flex h-full w-full items-center justify-center">
                        <Circle className="h-2.5 w-2.5" fill="currentColor" color="currentColor" />
                    </View>
                )}
            </Pressable>
        );
    }
);
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };

