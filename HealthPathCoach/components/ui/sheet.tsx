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
    useWindowDimensions,
} from 'react-native';
import { X } from 'lucide-react-native'; // Use RN icon
import { cn } from '@/lib/utils';

// Context to manage sheet visibility
interface SheetContextProps {
    isVisible: boolean;
    setVisible: (visible: boolean) => void;
    side: 'top' | 'bottom' | 'left' | 'right'; // Keep track of side
}

const SheetContext = React.createContext<SheetContextProps | null>(null);

const useSheetContext = () => {
    const context = React.useContext(SheetContext);
    if (!context) {
        throw new Error('Sheet components must be used within a <Sheet />');
    }
    return context;
};

// Sheet Root (Provides context)
interface SheetProps {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultOpen?: boolean;
    modal?: boolean; // Modal prop from Radix, always true in RN implementation
}

const Sheet = ({
    children,
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
}: SheetProps) => {
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

    // Default side, can be overridden by SheetContent
    const [side, setSide] = React.useState<'top' | 'bottom' | 'left' | 'right'>('right');

    return (
        <SheetContext.Provider
            value={{ isVisible, setVisible: handleOpenChange, side }}
        >
            {children}
        </SheetContext.Provider>
    );
};

// Trigger component (Basic Pressable)
const SheetTrigger = React.forwardRef<React.ElementRef<typeof Pressable>, PressableProps>(
    ({ children, onPress, ...props }, ref) => {
        const { setVisible } = useSheetContext();
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
    }
);
SheetTrigger.displayName = 'SheetTrigger';

// Close component (Basic Pressable)
const SheetClose = React.forwardRef<React.ElementRef<typeof Pressable>, PressableProps>(
    ({ children, onPress, ...props }, ref) => {
        const { setVisible } = useSheetContext();
        return (
            <Pressable
                ref={ref}
                onPress={(e) => {
                    setVisible(false);
                    onPress?.(e);
                }}
                {...props}
            >
                {children}
            </Pressable>
        );
    }
);
SheetClose.displayName = 'SheetClose';

// Overlay component (View inside Modal)
const SheetOverlay = React.forwardRef<View, ViewProps>(
    ({ className, ...props }, ref) => {
        const { isVisible } = useSheetContext();
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
SheetOverlay.displayName = 'SheetOverlay';

// Content component (Main modal content)
interface SheetContentProps extends ViewProps {
    side?: 'top' | 'bottom' | 'left' | 'right';
    children?: React.ReactNode;
}

const SheetContent = React.forwardRef<View, SheetContentProps>(
    ({ side = 'right', className, children, style, ...props }, ref) => {
        const { isVisible, setVisible } = useSheetContext();
        const { width, height } = useWindowDimensions();

        const getModalAnimation = () => {
            switch (side) {
                case 'top': return 'slideInDown';
                case 'bottom': return 'slideInUp';
                case 'left': return 'slideInLeft';
                case 'right': return 'slideInRight';
                default: return 'fade';
            }
        };

        const getModalStyle = () => {
            switch (side) {
                case 'top': return styles.sheetTop;
                case 'bottom': return styles.sheetBottom;
                case 'left': return [styles.sheetLeft, { height }];
                case 'right': return [styles.sheetRight, { height }];
                default: return styles.sheetRight; // Default to right
            }
        };

        return (
            <Modal
                visible={isVisible}
                onRequestClose={() => setVisible(false)}
                transparent={true}
                // Note: React Native Modal animationType is limited ('none', 'slide', 'fade')
                // We use 'slide' for bottom/top and 'fade' for left/right as a basic approximation
                animationType={side === 'bottom' || side === 'top' ? 'slide' : 'fade'}
            >
                <Pressable style={styles.modalContainer} onPress={() => setVisible(false)}>
                    <SheetOverlay />
                    {/* Prevent closing when pressing content */}
                    <Pressable>
                        <View
                            ref={ref}
                            // Removed complex cva variants and animations
                            className={cn(
                                'fixed z-50 gap-4 bg-background p-6 shadow-lg',
                                className
                            )}
                            style={[getModalStyle(), style]}
                            {...props}
                        >
                            {children}
                            <SheetClose asChild> 
                                <Pressable style={styles.closeButton}>
                                    <X size={16} className="text-muted-foreground" />
                                </Pressable>
                            </SheetClose>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        );
    }
);
SheetContent.displayName = 'SheetContent';

// Header component (Basic View)
const SheetHeader = ({ className, ...props }: ViewProps) => (
    <View
        className={cn(
            'flex flex-col space-y-2 text-center sm:text-left',
            className
        )}
        {...props}
    />
);
SheetHeader.displayName = 'SheetHeader';

// Footer component (Basic View)
const SheetFooter = ({ className, ...props }: ViewProps) => (
    <View
        className={cn(
            'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
            className
        )}
        {...props}
    />
);
SheetFooter.displayName = 'SheetFooter';

// Title component (Basic Text)
const SheetTitle = React.forwardRef<Text, TextProps>(
    ({ className, ...props }, ref) => (
        <Text
            ref={ref}
            className={cn('text-lg font-semibold text-foreground', className)}
            {...props}
        />
    )
);
SheetTitle.displayName = 'SheetTitle';

// Description component (Basic Text)
const SheetDescription = React.forwardRef<Text, TextProps>(
    ({ className, ...props }, ref) => (
        <Text
            ref={ref}
            className={cn('text-sm text-muted-foreground', className)}
            {...props}
        />
    )
);
SheetDescription.displayName = 'SheetDescription';

// Styles for Modal and Sheet positioning
const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    sheetBase: {
        position: 'absolute',
        // Common styles applied via className (bg, padding, shadow)
    },
    sheetTop: {
        top: 0,
        left: 0,
        right: 0,
        borderBottomWidth: 1,
        borderColor: '#e5e7eb', // border color
    },
    sheetBottom: {
        bottom: 0,
        left: 0,
        right: 0,
        borderTopWidth: 1,
        borderColor: '#e5e7eb',
    },
    sheetLeft: {
        top: 0,
        bottom: 0,
        left: 0,
        width: '75%', // w-3/4
        maxWidth: 384, // sm:max-w-sm approx
        borderRightWidth: 1,
        borderColor: '#e5e7eb',
    },
    sheetRight: {
        top: 0,
        bottom: 0,
        right: 0,
        width: '75%',
        maxWidth: 384,
        borderLeftWidth: 1,
        borderColor: '#e5e7eb',
    },
    closeButton: {
        position: 'absolute',
        right: 16, // right-4
        top: 16, // top-4
        padding: 8, // Make touch target larger
        borderRadius: 999,
        opacity: 0.7,
        // Removed ring, hover, focus styles
    },
});

// Note: SheetPortal is implicitly handled by Modal
const SheetPortal = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

export {
    Sheet,
    SheetPortal,
    SheetOverlay,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,    SheetDescription,
};
