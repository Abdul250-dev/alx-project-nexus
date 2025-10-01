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

// Context to manage drawer visibility
interface DrawerContextProps {
    isVisible: boolean;
    setVisible: (visible: boolean) => void;
}

const DrawerContext = React.createContext<DrawerContextProps | null>(null);

const useDrawerContext = () => {
    const context = React.useContext(DrawerContext);
    if (!context) {
        throw new Error('Drawer components must be used within a <Drawer />');
    }
    return context;
};

// Root component to provide context
const Drawer = ({ children }: { children: React.ReactNode }) => {
    const [isVisible, setVisible] = React.useState(false);
    // shouldScaleBackground prop from vaul is not applicable here
    return (
        <DrawerContext.Provider value={{ isVisible, setVisible }}>
            {children}
        </DrawerContext.Provider>
    );
};
Drawer.displayName = 'Drawer';

// Trigger component (Pressable to open the drawer)
const DrawerTrigger = React.forwardRef<React.ElementRef<typeof Pressable>, PressableProps>(
    ({ children, onPress, ...props }, ref) => {
        const { setVisible } = useDrawerContext();
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
DrawerTrigger.displayName = 'DrawerTrigger';

// Close component (Pressable to close the drawer)
const DrawerClose = React.forwardRef<React.ElementRef<typeof Pressable>, PressableProps>(
    ({ children, onPress, ...props }, ref) => {
        const { setVisible } = useDrawerContext();
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
DrawerClose.displayName = 'DrawerClose';

// Overlay component (part of the Modal)
const DrawerOverlay = React.forwardRef<View, ViewProps>(
    ({ className, ...props }, ref) => {
        // Call the hook at the top level of the component
        const { setVisible } = useDrawerContext();
        
        return (
            <Pressable
                ref={ref}
                style={styles.modalOverlay} // Use StyleSheet for fixed overlay
                onPress={() => setVisible(false)} // Use the setVisible from context
                className={cn(className)}
                {...props}
            />
        );
    }
);
DrawerOverlay.displayName = 'DrawerOverlay';

// Content component (The visible part of the drawer)
interface DrawerContentProps extends ViewProps {
    // Inherit View props
}
const DrawerContent = React.forwardRef<View, DrawerContentProps>(
    ({ className, children, style, ...props }, ref) => {
        const { isVisible, setVisible } = useDrawerContext();

        return (
            <Modal
                visible={isVisible}
                onRequestClose={() => setVisible(false)} // For Android back button
                animationType="slide" // Slide from bottom
                transparent={true}
            >
                <View style={styles.modalContainer} /* Outer container to handle positioning */>
                    {/* Pressable Overlay to close */}
                    <DrawerOverlay />
                    {/* Content Container View */}
                    <View
                        ref={ref}
                        className={cn(
                            'w-full flex-col rounded-t-lg border border-border bg-background',
                            // Removed fixed positioning, inset, mt-24
                            className
                        )}
                        style={[styles.drawerContent, style]} // Apply positioning styles
                        {...props}
                    >
                        {/* Handle indicator */}
                        <View className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
                        {children}
                    </View>
                </View>
            </Modal>
        );
    }
);
DrawerContent.displayName = 'DrawerContent';

// Header component (Basic View)
const DrawerHeader = ({ className, ...props }: ViewProps) => (
    <View
        className={cn('grid gap-1.5 p-4 text-center sm:text-left', className)}
        {...props}
    />
);
DrawerHeader.displayName = 'DrawerHeader';

// Footer component (Basic View)
const DrawerFooter = ({ className, ...props }: ViewProps) => (
    <View
        className={cn('mt-auto flex flex-col gap-2 p-4 border-t border-border', className)} // Added border-t for separation
        {...props}
    />
);
DrawerFooter.displayName = 'DrawerFooter';

// Title component (Basic Text)
const DrawerTitle = React.forwardRef<Text, TextProps>(
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
DrawerTitle.displayName = 'DrawerTitle';

// Description component (Basic Text)
const DrawerDescription = React.forwardRef<Text, TextProps>(
    ({ className, ...props }, ref) => (
        <Text
            ref={ref}
            className={cn('text-sm text-muted-foreground', className)}
            {...props}
        />
    )
);
DrawerDescription.displayName = 'DrawerDescription';

// Styles for Modal Overlay and Content Positioning
const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end', // Align content to bottom
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject, // Cover screen
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dimmed background
    },
    drawerContent: {
        // Define max height or calculate based on content if needed
        maxHeight: '80%', // Example max height
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        // Add other styles like padding if not handled by className
    },
});

// Note: DrawerPortal is implicitly handled by the Modal structure.
export {
    Drawer,
    DrawerTrigger,
    DrawerContent,
    DrawerHeader,
    DrawerFooter,
    DrawerTitle,
    DrawerDescription,
    DrawerClose,
    DrawerOverlay,
    // DrawerPortal is not needed as a separate export
};
