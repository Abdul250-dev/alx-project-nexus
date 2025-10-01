
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
import { X } from 'lucide-react-native'; // Use RN icon
import { cn } from '@/lib/utils';

// Context to manage modal visibility
interface DialogContextProps {
    isVisible: boolean;
    setVisible: (visible: boolean) => void;
}

const DialogContext = React.createContext<DialogContextProps | null>(null);

const useDialogContext = () => {
    const context = React.useContext(DialogContext);
    if (!context) {
        throw new Error('Dialog components must be used within a <Dialog />');
    }
    return context;
};

// Root component to provide context
const Dialog = ({ children }: { children: React.ReactNode }) => {
    const [isVisible, setVisible] = React.useState(false);
    return (
        <DialogContext.Provider value={{ isVisible, setVisible }}>
            {children}
        </DialogContext.Provider>
    );
};

// Trigger component (Pressable to open the modal)
const DialogTrigger = React.forwardRef<React.ElementRef<typeof Pressable>, PressableProps>(
    ({ children, onPress, ...props }, ref) => {
        const { setVisible } = useDialogContext();
        return (
            <Pressable
                ref={ref}
                onPress={(e) => {
                    setVisible(true);
                    onPress?.(e); // Call original onPress if provided
                }}
                {...props}
            >
                {children}
            </Pressable>
        );
    }
);
DialogTrigger.displayName = 'DialogTrigger';

// Close component (Pressable to close the modal)
const DialogClose = React.forwardRef<React.ElementRef<typeof Pressable>, PressableProps>(
    ({ children, onPress, ...props }, ref) => {
        const { setVisible } = useDialogContext();
        return (
            <Pressable
                ref={ref}
                onPress={(e) => {
                    setVisible(false);
                    onPress?.(e); // Call original onPress if provided
                }}
                {...props}
            >
                {children}
            </Pressable>
        );
    }
);
DialogClose.displayName = 'DialogClose';

// Modal Portal/Overlay/Content combined
// Uses React Native's Modal component
interface DialogContentProps extends ViewProps {
    // Inherit View props
}
const DialogContent = React.forwardRef<View, DialogContentProps>(
    ({ className, children, style, ...props }, ref) => {
        const { isVisible, setVisible } = useDialogContext();

        return (
            <Modal
                visible={isVisible}
                onRequestClose={() => setVisible(false)} // For Android back button
                animationType="fade" // Basic animation
                transparent={true}
            >
                {/* Overlay View */}
                <View style={styles.modalOverlay}>
                    {/* Content Container View */}
                    <View
                        ref={ref}
                        className={cn(
                            'w-full max-w-lg gap-4 border border-border bg-background p-6 shadow-lg sm:rounded-lg',
                            // Removed web-specific animations, positioning, translate
                            className
                        )}
                        style={style} // Allow passing custom styles
                        {...props}
                    >
                        {children}
                        {/* Default Close Button */}
                        <DialogClose
                            style={styles.closeButton}
                            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                        >
                            <X size={16} className="text-muted-foreground" />
                            {/* Removed sr-only span */}
                        </DialogClose>
                    </View>
                </View>
            </Modal>
        );
    }
);
DialogContent.displayName = 'DialogContent';

// Header component (Basic View)
const DialogHeader = ({ className, ...props }: ViewProps) => (
    <View
        className={cn(
            'flex flex-col space-y-1.5 text-center sm:text-left',
            className
        )}
        {...props}
    />
);
DialogHeader.displayName = 'DialogHeader';

// Footer component (Basic View)
const DialogFooter = ({ className, ...props }: ViewProps) => (
    <View
        className={cn(
            'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
            className
        )}
        {...props}
    />
);
DialogFooter.displayName = 'DialogFooter';

// Title component (Basic Text)
const DialogTitle = React.forwardRef<Text, TextProps>(
    ({ className, ...props }, ref) => (
        <Text
            ref={ref}
            className={cn(
                'text-lg font-semibold leading-none tracking-tight text-foreground',
                className
            )}
            {...props}
        />
    )
);
DialogTitle.displayName = 'DialogTitle';

// Description component (Basic Text)
const DialogDescription = React.forwardRef<Text, TextProps>(
    ({ className, ...props }, ref) => (
        <Text
            ref={ref}
            className={cn('text-sm text-muted-foreground', className)}
            {...props}
        />
    )
);
DialogDescription.displayName = 'DialogDescription';

// Styles for Modal Overlay and Close Button
const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent background like original
    },
    closeButton: {
        position: 'absolute',
        right: 16, // Corresponds to right-4
        top: 16, // Corresponds to top-4
        padding: 4, // Add padding for easier touch
        zIndex: 1, // Ensure it's clickable
    },
});

// Note: DialogPortal and DialogOverlay are implicitly handled by the Modal structure.
export {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogClose,
    // DialogPortal and DialogOverlay are not needed as separate exports
};

