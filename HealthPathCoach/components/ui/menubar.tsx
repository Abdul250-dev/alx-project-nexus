
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
import { Check, ChevronRight, Circle } from 'lucide-react-native'; // Use RN icons
import { cn } from '@/lib/utils';

// --- Placeholder Components ---
// NOTE: These are basic stubs replacing the Radix UI menubar.
// The actual menubar functionality (triggering menus on press, positioning, closing)
// needs to be implemented using React Native patterns.

// Context (Optional, for managing visibility of individual menus)
interface MenubarMenuContextProps {
    isVisible: boolean;
    setVisible: (visible: boolean) => void;
    // Could add trigger layout info here for positioning
}

const MenubarMenuContext = React.createContext<MenubarMenuContextProps | null>(null);

const useMenubarMenuContext = () => {
    const context = React.useContext(MenubarMenuContext);
    if (!context) {
        throw new Error('MenubarMenu components must be used within a <MenubarMenu />');
    }
    return context;
};

// Menubar Root (Container View)
const Menubar = React.forwardRef<View, ViewProps>(
    ({ className, ...props }, ref) => (
        <View
            ref={ref}
            className={cn(
                'flex flex-row h-10 items-center space-x-1 rounded-md border border-border bg-background p-1',
                className
            )}
            {...props}
        />
    )
);
Menubar.displayName = 'Menubar';

// Menubar Menu (Provides context for a single menu)
const MenubarMenu = ({ children }: { children: React.ReactNode }) => {
    const [isVisible, setVisible] = React.useState(false);
    return (
        <MenubarMenuContext.Provider value={{ isVisible, setVisible }}>
            {children}
        </MenubarMenuContext.Provider>
    );
};

// Trigger component (Pressable to open a specific menu)
const MenubarTrigger = React.forwardRef<React.ElementRef<typeof Pressable>, PressableProps>(
    ({ className, children, onPress, ...props }, ref) => {
        const { setVisible } = useMenubarMenuContext();
        return (
            <Pressable
                ref={ref}
                className={cn(
                    'flex items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none',
                    // Removed focus/data-state styles
                    className
                )}
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
MenubarTrigger.displayName = 'MenubarTrigger';

// Content: Intended to be rendered inside a Modal or positioned View
const MenubarContent = React.forwardRef<View, ViewProps>(
    ({ className, children, style, ...props }, ref) => {
        const { isVisible, setVisible } = useMenubarMenuContext();

        // Basic Modal implementation - positioning needs work for menubar behavior
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
                            // Basic styling, removed animations, complex positioning, align, offsets
                            className={cn(
                                'min-w-[12rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md',
                                className
                            )}
                            style={[styles.menuContent, style]} // Add basic positioning styles
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
MenubarContent.displayName = 'MenubarContent';

// Item: Basic Pressable
const MenubarItem = React.forwardRef<
    React.ElementRef<typeof Pressable>,
    PressableProps & { inset?: boolean }
>(({ className, inset, children, disabled, style, ...props }, ref) => (
    <Pressable
        ref={ref}
        disabled={disabled}
        className={cn(
            'relative flex flex-row items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none',
            inset && 'pl-8',
            disabled && 'opacity-50',
            className
        )}
        style={({ pressed }) => [
            pressed && { backgroundColor: '#e5e7eb' }, // Basic pressed style
            typeof style === 'function' ? style({ pressed }) : style,
        ]}
        {...props}
    >
        {children}
    </Pressable>
));
MenubarItem.displayName = 'MenubarItem';

// Checkbox Item: Pressable with Check icon
const MenubarCheckboxItem = React.forwardRef<
    React.ElementRef<typeof Pressable>,
    PressableProps & { checked?: boolean; children?: React.ReactNode }
>(({ className, children, checked, disabled, style, ...props }, ref) => (
    <Pressable
        ref={ref}
        disabled={disabled}
        className={cn(
            'relative flex flex-row items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
            disabled && 'opacity-50',
            className
        )}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: !!checked, disabled }}
        style={({ pressed }) => [
            pressed && { backgroundColor: '#e5e7eb' },
            typeof style === 'function' ? style({ pressed }) : style,
        ]}
        {...props}
    >
        <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            {checked && <Check size={16} className="text-foreground" />}
        </View>
        {children}
    </Pressable>
));
MenubarCheckboxItem.displayName = 'MenubarCheckboxItem';

// Radio Item: Pressable with Circle icon
const MenubarRadioItem = React.forwardRef<
    React.ElementRef<typeof Pressable>,
    PressableProps & { checked?: boolean; children?: React.ReactNode }
>(({ className, children, checked, disabled, style, ...props }, ref) => (
    <Pressable
        ref={ref}
        disabled={disabled}
        className={cn(
            'relative flex flex-row items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
            disabled && 'opacity-50',
            className
        )}
        accessibilityRole="radio"
        accessibilityState={{ checked: !!checked, disabled }}
        style={({ pressed }) => [
            pressed && { backgroundColor: '#e5e7eb' },
            typeof style === 'function' ? style({ pressed }) : style,
        ]}
        {...props}
    >
        <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            {checked && <Circle size={8} fill="currentColor" className="text-foreground" />}
        </View>
        {children}
    </Pressable>
));
MenubarRadioItem.displayName = 'MenubarRadioItem';

// Label: Basic Text
const MenubarLabel = React.forwardRef<
    Text,
    TextProps & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
    <Text
        ref={ref}
        className={cn(
            'px-2 py-1.5 text-sm font-semibold text-foreground',
            inset && 'pl-8',
            className
        )}
        {...props}
    />
));
MenubarLabel.displayName = 'MenubarLabel';

// Separator: Basic View
const MenubarSeparator = React.forwardRef<View, ViewProps>(
    ({ className, ...props }, ref) => (
        <View
            ref={ref}
            className={cn('my-1 h-px bg-muted', className)}
            {...props}
        />
    )
);
MenubarSeparator.displayName = 'MenubarSeparator';

// Shortcut: Basic Text
const MenubarShortcut = ({ className, ...props }: TextProps) => {
    return (
        <Text
            className={cn(
                'ml-auto text-xs tracking-widest text-muted-foreground opacity-60',
                className
            )}
            {...props}
        />
    );
};
MenubarShortcut.displayName = 'MenubarShortcut'; // Corrected displayname typo

// --- Omitted/Placeholder Components ---
const MenubarGroup = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
const MenubarPortal = ({ children }: { children?: React.ReactNode }) => <>{children}</>; // Modal handles portal implicitly
const MenubarSub = ({ children }: { children?: React.ReactNode }) => <>{children}</>; // Submenus require more complex logic
const MenubarSubTrigger = MenubarItem; // Use Item as placeholder
const MenubarSubContent = MenubarContent; // Use Content as placeholder
const MenubarRadioGroup = ({ children }: { children?: React.ReactNode }) => <>{children}</>;

// Styles for Modal Overlay and basic Content positioning
const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        // backgroundColor: 'rgba(0, 0, 0, 0.1)', // Optional subtle overlay
    },
    menuContent: {
        position: 'absolute',
        // Need logic here to position based on trigger coordinates
        // Example: top: 40, left: 10 (replace with calculated values)
        top: 40, // Placeholder position below trigger
        left: 10, // Placeholder position near trigger
        zIndex: 50,
    },
});

export {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
    MenubarContent,
    MenubarItem,
    MenubarSeparator,
    MenubarLabel,
    MenubarCheckboxItem,
    MenubarRadioItem,
    MenubarShortcut,
    // Exporting stubs/placeholders:
    MenubarGroup,
    MenubarPortal,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarRadioGroup,
};

