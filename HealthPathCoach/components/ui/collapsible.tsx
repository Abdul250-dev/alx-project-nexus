
import * as React from 'react';
import {
  View,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
  type ViewProps,
  type PressableProps,
} from 'react-native';
import { cn } from '@/lib/utils';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CollapsibleContextProps {
  isOpen: boolean;
  toggleOpen: () => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextProps | null>(null);

const useCollapsibleContext = () => {
  const context = React.useContext(CollapsibleContext);
  if (!context) {
    throw new Error('Collapsible components must be used within a <Collapsible />');
  }
  return context;
};

interface CollapsibleProps extends ViewProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

const Collapsible = React.forwardRef<View, CollapsibleProps>(
  (
    {
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

    const toggleOpen = React.useCallback(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Basic animation
      const nextOpen = !isOpen;
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    }, [isOpen, isControlled, onOpenChange]);

    const contextValue = React.useMemo(() => ({ isOpen, toggleOpen }), [isOpen, toggleOpen]);

    return (
      <CollapsibleContext.Provider value={contextValue}>
        <View ref={ref} className={cn(className)} {...props}>
          {children}
        </View>
      </CollapsibleContext.Provider>
    );
  }
);
Collapsible.displayName = 'Collapsible';

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  PressableProps
>(({ children, onPress, ...props }, ref) => {
  const { toggleOpen } = useCollapsibleContext();
  return (
    <Pressable
      ref={ref}
      onPress={(e) => {
        toggleOpen();
        onPress?.(e);
      }}
      // Add accessibility state based on context.isOpen if needed
      {...props}
    >
      {children}
    </Pressable>
  );
});
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

const CollapsibleContent = React.forwardRef<View, ViewProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen } = useCollapsibleContext();

    // Conditionally render the content based on the open state
    if (!isOpen) {
      return null;
    }

    return (
      <View
        ref={ref}
        // Removed animation classes (data-[state=open]:animate-collapsible-down etc.)
        className={cn('overflow-hidden', className)}
        {...props}
      >
        {children}
      </View>
    );
  }
);
CollapsibleContent.displayName = 'CollapsibleContent';

export { Collapsible, CollapsibleTrigger, CollapsibleContent };

