
import * as React from 'react';
import {
    View,
    Pressable,
    Modal,
    StyleSheet,
    type ViewProps,
    type PressableProps,
    type ModalProps,
} from 'react-native';
import { cn } from '@/lib/utils';

// --- Placeholder Components ---
// NOTE: These are basic stubs replacing @radix-ui/react-hover-card.
// The hover functionality is removed. Showing content requires
// custom implementation (e.g., on press/long press).

// Context to manage visibility
interface HoverCardContextProps {
    isVisible: boolean;
    setVisible: (visible: boolean) => void;
    // Could add trigger layout info here for positioning
}

const HoverCardContext = React.createContext<HoverCardContextProps | null>(null);

const useHoverCardContext = () => {
    const context = React.useContext(HoverCardContext);
    if (!context) {
        throw new Error('HoverCard components must be used within a <HoverCard />');
    }
    return context;
};

// HoverCard Root (Provides context)
interface HoverCardProps {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
    openDelay?: number; // Ignored
    closeDelay?: number; // Ignored
}

const HoverCard = ({
    children,
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
}: HoverCardProps) => {
    // Handle uncontrolled state
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
    const isControlled = controlledOpen !== undefined;
    const isVisible = isControlled ? controlledOpen : uncontrolledOpen;

    const handleOpenChange = (open: boolean) => {
        if (!isControlled) {
            setUncontrolledOpen(open);
        }
        onOpenChange?.(open);
    };

    return (
        <HoverCardContext.Provider
            value={{ isVisible, setVisible: handleOpenChange }}
        >
            {children}
        </HoverCardContext.Provider>
    );
};

// Trigger component (Basic Pressable - needs onPress logic added where used)
const HoverCardTrigger = React.forwardRef<
    React.ElementRef<typeof Pressable>,
    PressableProps
>(({ children, onPress, ...props }, ref) => {
    const { setVisible } = useHoverCardContext();
    // Example: Trigger on press - this might need to be long press etc.
    const handlePress = (e: any) => {
        setVisible(true);
        onPress?.(e);
    };

    return (
        <Pressable ref={ref} onPress={handlePress} {...props}>
            {children}
        </Pressable>
    );
});
HoverCardTrigger.displayName = 'HoverCardTrigger';

// Content: Rendered inside a Modal or positioned View (using Modal here)
interface HoverCardContentProps extends ViewProps {
    align?: string; // Ignored
    sideOffset?: number; // Ignored
}

const HoverCardContent = React.forwardRef<
    View,
    HoverCardContentProps
>(({ className, children, style, ...props }, ref) => {
    const { isVisible, setVisible } = useHoverCardContext();

    // Using a simple centered Modal as a placeholder
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
                        // Basic styling, removed animations, complex positioning
                        className={cn(
                            'z-50 w-64 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none',
                            className
                        )}
                        style={[styles.content, style]} // Basic positioning
                        {...props}
                    >
                        {children}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
});
HoverCardContent.displayName = 'HoverCardContent';

// Styles for Modal Overlay and basic Content positioning
const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)', // Subtle overlay
    },
    content: {
        // Basic centered positioning via modal overlay
        // Positioning relative to trigger would require more complex logic
    },
});

export { HoverCard, HoverCardTrigger, HoverCardContent };

