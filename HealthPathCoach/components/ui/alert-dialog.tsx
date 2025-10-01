
import * as React from 'react';
import {
    View,
    Text,
    Pressable,
    Modal,
    StyleSheet,
    type ViewProps,
    type TextProps,
    type PressableProps,
    type ModalProps,
} from 'react-native';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Import the fixed RN Button

// Context to manage modal visibility
interface AlertDialogContextProps {
    isVisible: boolean;
    setVisible: (visible: boolean) => void;
}

const AlertDialogContext = React.createContext<AlertDialogContextProps | null>(null);

const useAlertDialogContext = () => {
    const context = React.useContext(AlertDialogContext);
    if (!context) {
        throw new Error('AlertDialog components must be used within an <AlertDialog />');
    }
    return context;
};

// AlertDialog Root (Provides context)
interface AlertDialogProps {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
}

const AlertDialog = ({
    children,
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
}: AlertDialogProps) => {
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
        <AlertDialogContext.Provider
            value={{ isVisible, setVisible: handleOpenChange }}
        >
            {children}
        </AlertDialogContext.Provider>
    );
};

// Trigger component (Basic Pressable)
const AlertDialogTrigger = React.forwardRef<
    React.ElementRef<typeof Pressable>,
    PressableProps
>(({ children, onPress, ...props }, ref) => {
    const { setVisible } = useAlertDialogContext();
    return (
        <Pressable
            ref={ref}
            onPress={(e) => {
                setVisible(true);
                onPress?.(e);
            }}
            {...props}
        >
            {children}
        </Pressable>
    );
});
AlertDialogTrigger.displayName = 'AlertDialogTrigger';

// Overlay component (View inside Modal)
const AlertDialogOverlay = React.forwardRef<View, ViewProps>(
    ({ className, ...props }, ref) => {
        const { isVisible } = useAlertDialogContext();
        if (!isVisible) return null;

        return (
            <View
                ref={ref}
                // Removed animation classes
                className={cn('absolute inset-0 z-50 bg-black/80', className)}
                style={styles.modalOverlay}
                {...props}
            />
        );
    }
);
AlertDialogOverlay.displayName = 'AlertDialogOverlay';

// Content component (Main modal content)
const AlertDialogContent = React.forwardRef<View, ViewProps>(
    ({ className, children, style, ...props }, ref) => {
        const { isVisible, setVisible } = useAlertDialogContext();

        return (
            <Modal
                visible={isVisible}
                onRequestClose={() => setVisible(false)} // Allow closing via back button/escape
                transparent={true}
                animationType="fade"
            >
                {/* Use Pressable overlay to prevent closing on background tap if needed */}
                {/* <Pressable style={styles.modalContainer} onPress={() => setVisible(false)}> */}
                <View style={styles.modalContainer}>
                    <AlertDialogOverlay />
                    {/* Prevent closing when pressing content */}
                    <Pressable>
                        <View
                            ref={ref}
                            // Removed complex animations, positioning based on state
                            className={cn(
                                'fixed z-50 grid w-[90%] max-w-lg gap-4 border border-border bg-background p-6 shadow-lg sm:rounded-lg',
                                className
                            )}
                            style={[styles.dialogContent, style]} // Centering styles
                            {...props}
                        >
                            {children}
                        </View>
                    </Pressable>
                {/* </Pressable> */}
                </View>
            </Modal>
        );
    }
);
AlertDialogContent.displayName = 'AlertDialogContent';

// Header component (Basic View)
const AlertDialogHeader = ({ className, ...props }: ViewProps) => (
    <View
        className={cn(
            'flex flex-col space-y-2 text-center sm:text-left',
            className
        )}
        {...props}
    />
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

// Footer component (Basic View)
const AlertDialogFooter = ({ className, ...props }: ViewProps) => (
    <View
        className={cn(
            'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
            className
        )}
        {...props}
    />
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

// Title component (Basic Text)
const AlertDialogTitle = React.forwardRef<Text, TextProps>(
    ({ className, ...props }, ref) => (
        <Text
            ref={ref}
            className={cn('text-lg font-semibold text-foreground', className)}
            {...props}
        />
    )
);
AlertDialogTitle.displayName = 'AlertDialogTitle';

// Description component (Basic Text)
const AlertDialogDescription = React.forwardRef<Text, TextProps>(
    ({ className, ...props }, ref) => (
        <Text
            ref={ref}
            className={cn('text-sm text-muted-foreground', className)}
            {...props}
        />
    )
);
AlertDialogDescription.displayName = 'AlertDialogDescription';

// Action component (Uses fixed RN Button)
const AlertDialogAction = React.forwardRef<
    React.ElementRef<typeof Button>,
    React.ComponentPropsWithoutRef<typeof Button>
>(({ className, onPress, ...props }, ref) => {
    const { setVisible } = useAlertDialogContext();
    return (
        <Button
            ref={ref}
            className={cn(className)} // Apply base button styles + custom
            onPress={(e) => {
                // Optionally close dialog on action, depends on usage
                // setVisible(false);
                onPress?.(e);
            }}
            {...props}
        />
    );
});
AlertDialogAction.displayName = 'AlertDialogAction';

// Cancel component (Uses fixed RN Button with outline variant)
const AlertDialogCancel = React.forwardRef<
    React.ElementRef<typeof Button>,
    React.ComponentPropsWithoutRef<typeof Button>
>(({ className, onPress, ...props }, ref) => {
    const { setVisible } = useAlertDialogContext();
    return (
        <Button
            ref={ref}
            variant="outline" // Use outline variant
            className={cn('mt-2 sm:mt-0', className)}
            onPress={(e) => {
                setVisible(false); // Always close on cancel
                onPress?.(e);
            }}
            {...props}
        />
    );
});
AlertDialogCancel.displayName = 'AlertDialogCancel';

// Styles for Modal Overlay and Content Positioning
const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    dialogContent: {
        // Centered by modalContainer
    },
});

// Note: AlertDialogPortal is implicitly handled by Modal
const AlertDialogPortal = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

export {
    AlertDialog,
    AlertDialogPortal,
    AlertDialogOverlay,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
};

