import React, { useState, createContext, useContext } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native'; // Use lucide-react-native
import { cn } from '@/lib/utils'; // Assuming this utility handles class names for React Native

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Context to potentially manage accordion state (e.g., allowing only one item open)
// For simplicity, this version uses local state within each item.
interface AccordionContextProps {
  openItemValue: string | null;
  setOpenItemValue: (value: string | null) => void;
  type: 'single' | 'multiple';
}

const AccordionContext = createContext<AccordionContextProps | null>(null);

const Accordion = React.forwardRef<
  View,
  React.ComponentPropsWithoutRef<typeof View> & {
    type?: 'single' | 'multiple';
    defaultValue?: string | string[];
    collapsible?: boolean; // For single type, allows closing the open item
  }
>(({ className, children, type = 'single', defaultValue, collapsible = false, ...props }, ref) => {
  const [openItemValue, setOpenItemValue] = useState<string | null>(() => {
    if (type === 'single' && typeof defaultValue === 'string') {
      return defaultValue;
    }
    // Note: defaultValue for 'multiple' type is not handled in this simplified state
    return null;
  });

  const contextValue = React.useMemo(() => ({
    openItemValue,
    setOpenItemValue: (value: string | null) => {
      if (type === 'single') {
        setOpenItemValue(currentValue => {
            // Allow closing if collapsible is true
            if (collapsible && currentValue === value) {
                return null;
            }
            return value;
        });
      } else {
        // Multiple type state management would be more complex (e.g., array of values)
        console.warn('Accordion type="multiple" state not fully implemented in this version.');
        // Simple toggle for multiple for now:
        setOpenItemValue(currentValue => currentValue === value ? null : value);
      }
    },
    type,
  }), [openItemValue, type, collapsible]);

  return (
    <AccordionContext.Provider value={contextValue}>
      <View ref={ref} className={cn(className)} {...props}>
        {children}
      </View>
    </AccordionContext.Provider>
  );
});
Accordion.displayName = 'Accordion';


const AccordionItem = React.forwardRef<
  View,
  React.ComponentPropsWithoutRef<typeof View> & { value: string } // Each item needs a unique value
>(({ className, children, value, ...props }, ref) => {
  const context = useContext(AccordionContext);

  if (!context) {
    throw new Error('AccordionItem must be used within an Accordion');
  }

  const isOpen = context.type === 'single' ? context.openItemValue === value : false; // Simplified check for multiple

  const toggleOpen = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Basic animation
    context.setOpenItemValue(value);
  };

  // Provide isOpen and toggleOpen to children (Trigger and Content)
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, { isOpen, toggleOpen });
    }
    return child;
  });

  return (
    <View ref={ref} className={cn('border-b border-border', className)} {...props}>
      {childrenWithProps}
    </View>
  );
});
AccordionItem.displayName = 'AccordionItem';


const AccordionTrigger = React.forwardRef<
  Pressable,
  React.ComponentPropsWithoutRef<typeof Pressable> & { children?: React.ReactNode; isOpen?: boolean; toggleOpen?: () => void }
>(({ className, children, isOpen, toggleOpen, ...props }, ref) => {
  return (
    <Pressable
      ref={ref}
      onPress={toggleOpen}
      className={cn(
        'flex-1 flex-row items-center justify-between py-4 font-medium transition-all',
        // hover:underline is not directly translatable to React Native
        className
      )}
      {...props}
    >
      {/* Assuming children is the title text - might need explicit Text wrapper */}
      {typeof children === 'string' ? (
        <Text className="text-foreground">{children}</Text>
      ) : (
        children
      )}
      <ChevronDown
        className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
            // NativeWind might support rotate utilities, or use style
            isOpen && 'rotate-180'
        )}
        // Use style for rotation as a fallback or if NativeWind doesn\'t support rotate
        style={{
            transform: [{ rotate: isOpen ? '180deg' : '0deg' }],
        }}
      />
    </Pressable>
  );
});
AccordionTrigger.displayName = 'AccordionTrigger';


const AccordionContent = React.forwardRef<
  View,
  React.ComponentPropsWithoutRef<typeof View> & { children?: React.ReactNode; isOpen?: boolean }
>(({ className, children, isOpen, ...props }, ref) => {

  // Use a container View that animates its height, or simply conditional render
  if (!isOpen) {
    return null; // Simple conditional rendering
  }

  // The Radix version has complex animation classes (animate-accordion-up/down)
  // Replicating those exactly requires more setup (e.g., Reanimated)
  // This version just shows/hides the content.

  return (
    <View
      ref={ref}
      className={cn('overflow-hidden text-sm transition-all', className)}
      {...props}
    >
        {/* pt-0 is default, pb-4 is applied */}
      <View className={cn('pb-4', className)}>{children}</View>
    </View>
  );
});
AccordionContent.displayName = 'AccordionContent';

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
