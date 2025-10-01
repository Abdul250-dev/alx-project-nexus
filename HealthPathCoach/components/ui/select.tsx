import * as React from 'react';
import {
    View,
    Text,
    Pressable,
    Modal,
    ScrollView,
    StyleSheet,
    type ViewProps,
    type TextProps,
    type PressableProps,
    type ModalProps,
    type ScrollViewProps,
} from 'react-native';
import { Check, ChevronDown, ChevronUp } from 'lucide-react-native'; // Use RN icons
import { cn } from '@/lib/utils';

// --- Placeholder Components ---
// NOTE: These are basic stubs replacing the Radix UI select.
// The actual dropdown functionality (showing options, selection, positioning)
// needs to be implemented using React Native patterns.

// Context to manage select state (visibility, selected value)
interface SelectContextProps {
    isVisible: boolean;
    setVisible: (visible: boolean) => void;
    selectedValue: string | undefined;
    setSelectedValue: (value: string | undefined) => void;
    // Could add trigger layout info here for positioning
}

const SelectContext = React.createContext<SelectContextProps | null>(null);

const useSelectContext = () => {
    const context = React.useContext(SelectContext);
    if (!context) {
        throw new Error('Select components must be used within a <Select />');
    }
    return context;
};

// Select Root (Provides context)
interface SelectProps {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (value: string) => void;
    defaultValue?: string;
    // Add open, onOpenChange, disabled etc. if needed
}

const Select = ({
    children,
    value: controlledValue,
    defaultValue,
    onValueChange,
}: SelectProps) => {
    const [isVisible, setVisible] = React.useState(false);
    // Handle uncontrolled state
    const [uncontrolledValue, setUncontrolledValue] = React.useState<string | undefined>(
        defaultValue
    );
    const isControlled = controlledValue !== undefined;
    const selectedValue = isControlled ? controlledValue : uncontrolledValue;

    const handleValueChange = (newValue: string | undefined) => {
        if (!isControlled) {
            setUncontrolledValue(newValue);
        }
        if (newValue !== undefined) {
            onValueChange?.(newValue);
        }
        setVisible(false); // Close on selection
    };

    return (
        <SelectContext.Provider
            value={{
                isVisible,
                setVisible,
                selectedValue,
                setSelectedValue: handleValueChange,
            }}
        >
            {children}
        </SelectContext.Provider>
    );
};

// Trigger component (Pressable to open the modal)
const SelectTrigger = React.forwardRef<
    React.ElementRef<typeof Pressable>,
    PressableProps
>(({ className, children, ...props }, ref) => {
    const { setVisible, selectedValue } = useSelectContext();
    return (
        <Pressable
            ref={ref}
            className={cn(
                'flex h-10 w-full flex-row items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm',
                // Removed web-specific ring, focus, placeholder styles
                props.disabled && 'opacity-50',
                className
            )}
            onPress={() => setVisible(true)}
            accessibilityRole="button" // Or combobox?
            {...props}
        >
            {/* Render children (likely SelectValue) or placeholder */}
            {children ?? <Text className="text-muted-foreground">Select...</Text>}
            <ChevronDown size={16} className="h-4 w-4 opacity-50" />
        </Pressable>
    );
});
SelectTrigger.displayName = 'SelectTrigger';

// Value component (Displays the selected value)
interface SelectValueProps extends TextProps {
    placeholder?: string;
}
const SelectValue = React.forwardRef<Text, SelectValueProps>(
    ({ className, placeholder, ...props }, ref) => {
        const { selectedValue } = useSelectContext();
        // In a real implementation, this might need to find the label corresponding to the value
        const displayValue = selectedValue ?? placeholder;
        return (
            <Text
                ref={ref}
                className={cn('text-sm text-foreground', !selectedValue && 'text-muted-foreground', className)}
                numberOfLines={1}
                {...props}
            >
                {displayValue}
            </Text>
        );
    }
);
SelectValue.displayName = 'SelectValue';

// Content: Rendered inside a Modal
const SelectContent = React.forwardRef<
    View,
    ViewProps & { position?: string } // position prop ignored
>(({ className, children, ...props }, ref) => {
    const { isVisible, setVisible } = useSelectContext();

    return (
        <Modal
            visible={isVisible}
            onRequestClose={() => setVisible(false)}
            transparent={true}
            animationType="fade"
        >
            <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
                {/* Prevent closing when pressing content */}
                <Pressable>
                    <View
                        ref={ref}
                        // Basic styling, removed animations, complex positioning, side/align offsets
                        className={cn(
                            'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md',
                            className
                        )}
                        style={styles.selectContent} // Add basic positioning styles
                        {...props}
                    >
                        {/* ScrollView replaces Viewport and Scroll Buttons */}
                        <ScrollView style={styles.scrollView}>
                            {children}
                        </ScrollView>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
});
SelectContent.displayName = 'SelectContent';

// Item: Basic Pressable
interface SelectItemProps extends PressableProps {
    value: string;
    children: React.ReactNode;
}
const SelectItem = React.forwardRef<React.ElementRef<typeof Pressable>, SelectItemProps>(
    ({ className, children, value, disabled, style, ...props }, ref) => {
        const { selectedValue, setSelectedValue } = useSelectContext();
        const isSelected = selectedValue === value;

        return (
            <Pressable
                ref={ref}
                disabled={disabled}
                onPress={() => setSelectedValue(value)}
                className={cn(
                    'relative flex flex-row w-full items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
                    disabled && 'opacity-50',
                    className
                )}
                style={({ pressed }) => [
                    pressed && { backgroundColor: '#e5e7eb' }, // Basic pressed style
                    typeof style === 'function' ? style({ pressed }) : style,
                ]}
                accessibilityRole="menuitemradio" // Or option?
                accessibilityState={{ checked: isSelected, disabled }}
                {...props}
            >
                <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {isSelected && <Check size={16} className="text-foreground" />}
                </View>
                {/* Render ItemText equivalent */}
                {typeof children === 'string' ? <Text className="text-foreground">{children}</Text> : children}
            </Pressable>
        );
    }
);
SelectItem.displayName = 'SelectItem';

// Label: Basic Text
const SelectLabel = React.forwardRef<Text, TextProps>(
    ({ className, ...props }, ref) => (
        <Text
            ref={ref}
            className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold text-muted-foreground', className)}
            {...props}
        />
    )
);
SelectLabel.displayName = 'SelectLabel';

// Separator: Basic View
const SelectSeparator = React.forwardRef<View, ViewProps>(
    ({ className, ...props }, ref) => (
        <View
            ref={ref}
            className={cn('-mx-1 my-1 h-px bg-muted', className)}
            {...props}
        />
    )
);
SelectSeparator.displayName = 'SelectSeparator';

// --- Omitted/Placeholder Components ---
const SelectGroup = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
const SelectScrollUpButton = () => null; // Replaced by ScrollView
const SelectScrollDownButton = () => null; // Replaced by ScrollView

// Styles for Modal Overlay and basic Content positioning
const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    selectContent: {
        // Need logic here to position based on trigger coordinates if not centered
        width: '80%', // Example width
        maxHeight: '60%', // Example max height
        zIndex: 50,
    },
    scrollView: {
        padding: 4, // Mimic p-1
    },
});

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
    // SelectScrollUpButton, // Omitted
    // SelectScrollDownButton, // Omitted
};
