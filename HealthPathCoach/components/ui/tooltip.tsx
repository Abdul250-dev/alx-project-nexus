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

// Context to manage tooltip visibility
interface TooltipContextProps {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<View>;
}

const TooltipContext = React.createContext<TooltipContextProps | null>(null);

const useTooltipContext = () => {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error('Tooltip components must be used within a <Tooltip />');
  }
  return context;
};

// Provider component (for global configuration)
interface TooltipProviderProps {
  children: React.ReactNode;
  delayDuration?: number; // Not directly used in RN implementation
  skipDelayDuration?: number; // Not directly used in RN implementation
}

const TooltipProvider = ({ children }: TooltipProviderProps) => {
  return <>{children}</>;
};

// Root component
interface TooltipProps {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number; // Not directly used in RN implementation
}

const Tooltip = ({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: TooltipProps) => {
  // Handle controlled/uncontrolled state
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
    <TooltipContext.Provider value={{ isOpen, setOpen, triggerRef }}>
      {children}
    </TooltipContext.Provider>
  );
};

// Trigger component
const TooltipTrigger = React.forwardRef<View, PressableProps>(
  ({ children, onPress, onLongPress, ...props }, ref) => {
    const { setOpen, triggerRef } = useTooltipContext();
    
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
          onPress?.(e);
        }}
        onLongPress={(e) => {
          setOpen(true);
          onLongPress?.(e);
        }}
        {...props}
      >
        {children}
      </Pressable>
    );
  }
);
TooltipTrigger.displayName = 'TooltipTrigger';

// Content component
interface TooltipContentProps extends ViewProps {
  sideOffset?: number;
}

const TooltipContent = React.forwardRef<View, TooltipContentProps>(
  ({ className, sideOffset = 4, children, style, ...props }, ref) => {
    const { isOpen, setOpen } = useTooltipContext();

    if (!isOpen) return null;

    return (
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View
            ref={ref}
            className={cn(
              "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
              className
            )}
            style={[styles.content, style]}
            {...props}
          >
            {typeof children === 'string' ? (
              <Text className="text-sm text-popover-foreground">{children}</Text>
            ) : (
              children
            )}
          </View>
        </Pressable>
      </Modal>
    );
  }
);
TooltipContent.displayName = 'TooltipContent';

// Styles for overlay and content
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Transparent overlay for tooltips
  },
  content: {
    backgroundColor: 'white',
    // In a real implementation, we would calculate position based on triggerRef
    // and sideOffset prop
  },
});

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
