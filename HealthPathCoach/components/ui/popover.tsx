import * as React from 'react';
import {
    View,
    Text,
    Pressable,
    Modal,
    StyleSheet,
    type ViewProps,
    type PressableProps,
} from 'react-native';
import { cn } from '@/lib/utils';

// Context to manage popover visibility
interface PopoverContextProps {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    triggerRef: React.RefObject<View>;
}

const PopoverContext = React.createContext<PopoverContextProps | null>(null);

const usePopoverContext = () => {
    const context = React.useContext(PopoverContext);
    if (!context) {
        throw new Error('Popover components must be used within a <Popover />');
    }
    return context;
};

// Popover Root (Provides context)
interface PopoverProps {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
}

const Popover = ({
    children,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
}: PopoverProps) => {
    // Handle uncontrolled state
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
    const triggerRef = React.useRef<View>(null);

    const setOpen = React.useCallback(
        (open: boolean) => {
            if (!isControlled) {
                setUncontrolledOpen(open);
            }
            onOpenChange?.(open);
        },
        [isControlled, onOpenChange]
    );

    return (
        <PopoverContext.Provider value={{ isOpen, setOpen, triggerRef }}>
            {children}
        </PopoverContext.Provider>
    );
};

// Trigger component (Basic Pressable)
const PopoverTrigger = React.forwardRef<View, PressableProps>(
    ({ children, onPress, ...props }, ref) => {
        const { setOpen, triggerRef } = usePopoverContext();
        
        // Combine refs
        const combinedRef = React.useCallback(
            (node: View | null) => {
                // Apply the forwarded ref
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref) {
                    ref.current = node;
                }
                
                // Apply our internal ref
                if (node) {
                    triggerRef.current = node;
                }
            },
            [ref, triggerRef]
        );

        return (
            <Pressable
                ref={combinedRef}
                onPress={(e) => {
                    setOpen(true);
                    onPress?.(e);
                }}
                {...props}
            >
                {children}
            </Pressable>
        );
    }
);
PopoverTrigger.displayName = 'PopoverTrigger';

// Content component (Modal with positioned content)
interface PopoverContentProps extends ViewProps {
    align?: 'start' | 'center' | 'end';
    sideOffset?: number;
}

const PopoverContent = React.forwardRef<View, PopoverContentProps>(
    ({ className, align = 'center', sideOffset = 4, children, style, ...props }, ref) => {
        const { isOpen, setOpen } = usePopoverContext();

        return (
            <Modal
                visible={isOpen}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setOpen(false)}
            >
                <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
                    <Pressable>
                        <View
                            ref={ref}
                            className={cn(
                                'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md',
                                className
                            )}
                            style={[styles.content, style]}
                            {...props}
                        >
                            {children}
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        );
    }
);
PopoverContent.displayName = 'PopoverContent';

// Styles for overlay and content
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    content: {
        backgroundColor: 'white',
        // In a real implementation, we would calculate position based on triggerRef
        // and align/sideOffset props
    },
});

export { Popover, PopoverTrigger, PopoverContent };
