import * as React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  StyleSheet,
  type ViewProps,
  type TextProps,
  type PressableProps,
} from 'react-native';
import { cn } from '@/lib/utils';

// Create a context for sidebar state
interface SidebarContextProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  collapsible: boolean;
  collapsedSize: number;
  size: number;
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

// Hook to use sidebar context
const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

// Provider component
interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  collapsible?: boolean;
  collapsedSize?: number;
  size?: number;
}

const SidebarProvider = ({
  children,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  collapsible = false,
  collapsedSize = 16,
  size = 240,
}: SidebarProviderProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(value);
      }
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        collapsible,
        collapsedSize,
        size,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

// Main sidebar component
interface SidebarProps extends ViewProps {
  collapsible?: 'icon' | boolean;
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const Sidebar = React.forwardRef<View, SidebarProps>(
  ({ className, collapsible = false, defaultCollapsed = false, collapsed: controlledCollapsed, onCollapsedChange, ...props }, ref) => {
    const context = useSidebar();
    const [uncontrolledCollapsed, setUncontrolledCollapsed] = React.useState(defaultCollapsed);
    const isControlled = controlledCollapsed !== undefined;
    const isCollapsed = isControlled ? controlledCollapsed : uncontrolledCollapsed;
    
    // Animation value for width
    const widthAnim = React.useRef(new Animated.Value(isCollapsed ? 0 : 1)).current;
    
    // Update animation when collapsed state changes
    React.useEffect(() => {
      Animated.timing(widthAnim, {
        toValue: isCollapsed ? 0 : 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }, [isCollapsed, widthAnim]);
    
    // Calculate width based on animation value
    const width = widthAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [context.collapsedSize, context.size],
    });
    
    return (
      <Animated.View
        ref={ref}
        className={cn(
          "flex h-full flex-col bg-sidebar border-r border-sidebar-border",
          className
        )}
        style={{ width }}
        {...props}
      />
    );
  }
);
Sidebar.displayName = 'Sidebar';

// Sidebar header component
const SidebarHeader = React.forwardRef<View, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("flex h-14 items-center px-4", className)}
      {...props}
    />
  )
);
SidebarHeader.displayName = 'SidebarHeader';

// Sidebar content component (scrollable)
const SidebarContent = React.forwardRef<ScrollView, ViewProps>(
  ({ className, ...props }, ref) => (
    <ScrollView
      ref={ref}
      className={cn("flex-1", className)}
      showsVerticalScrollIndicator={false}
      {...props}
    />
  )
);
SidebarContent.displayName = 'SidebarContent';

// Sidebar footer component
const SidebarFooter = React.forwardRef<View, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("flex shrink-0 px-4 py-2", className)}
      {...props}
    />
  )
);
SidebarFooter.displayName = 'SidebarFooter';

// Sidebar trigger component
const SidebarTrigger = React.forwardRef<Pressable, PressableProps>(
  ({ className, ...props }, ref) => {
    const { open, setOpen } = useSidebar();
    
    return (
      <Pressable
        ref={ref}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md border border-sidebar-border bg-sidebar text-sidebar-foreground",
          className
        )}
        onPress={() => setOpen(!open)}
        accessibilityRole="button"
        accessibilityLabel={open ? "Close sidebar" : "Open sidebar"}
        {...props}
      />
    );
  }
);
SidebarTrigger.displayName = 'SidebarTrigger';

// Sidebar rail component
const SidebarRail = React.forwardRef<View, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("flex w-12 flex-col items-center py-2", className)}
      {...props}
    />
  )
);
SidebarRail.displayName = 'SidebarRail';

// Sidebar separator component
const SidebarSeparator = React.forwardRef<View, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("mx-4 my-2 h-px bg-sidebar-border", className)}
      {...props}
    />
  )
);
SidebarSeparator.displayName = 'SidebarSeparator';

// Sidebar group components
const SidebarGroup = React.forwardRef<View, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("px-2 py-1", className)}
      {...props}
    />
  )
);
SidebarGroup.displayName = 'SidebarGroup';

const SidebarGroupLabel = React.forwardRef<Text, TextProps>(
  ({ className, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn(
        "px-2 py-1.5 text-xs font-medium text-sidebar-foreground-muted",
        className
      )}
      {...props}
    />
  )
);
SidebarGroupLabel.displayName = 'SidebarGroupLabel';

const SidebarGroupContent = React.forwardRef<View, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("space-y-1", className)}
      {...props}
    />
  )
);
SidebarGroupContent.displayName = 'SidebarGroupContent';

const SidebarGroupAction = React.forwardRef<Pressable, PressableProps>(
  ({ className, ...props }, ref) => (
    <Pressable
      ref={ref}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground-muted hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        className
      )}
      {...props}
    />
  )
);
SidebarGroupAction.displayName = 'SidebarGroupAction';

// Sidebar menu components
const SidebarMenu = React.forwardRef<View, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
);
SidebarMenu.displayName = 'SidebarMenu';

const SidebarMenuItem = React.forwardRef<View, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("relative", className)}
      {...props}
    />
  )
);
SidebarMenuItem.displayName = 'SidebarMenuItem';

// Simplified input component
const SidebarInput = React.forwardRef<View, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("mx-2 my-1", className)}
      {...props}
    />
  )
);
SidebarInput.displayName = 'SidebarInput';

// Simplified inset component
const SidebarInset = React.forwardRef<View, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("mx-2 my-1", className)}
      {...props}
    />
  )
);
SidebarInset.displayName = 'SidebarInset';

// Menu button component
interface SidebarMenuButtonProps extends PressableProps {
  isActive?: boolean;
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
}

const SidebarMenuButton = React.forwardRef<Pressable, SidebarMenuButtonProps>(
  ({ className, isActive = false, size = 'default', showIcon = true, children, ...props }, ref) => {
    return (
      <Pressable
        ref={ref}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50",
          size === 'sm' && "h-8 text-xs",
          size === 'default' && "h-9 text-sm",
          size === 'lg' && "h-11 text-base",
          isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
          className
        )}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text 
            className={cn(
              "flex-1 truncate",
              isActive ? "font-medium" : "font-normal"
            )}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    );
  }
);
SidebarMenuButton.displayName = 'SidebarMenuButton';

// Menu action component
const SidebarMenuAction = React.forwardRef<Pressable, PressableProps & { showOnHover?: boolean }>(
  ({ className, showOnHover = false, ...props }, ref) => (
    <Pressable
      ref={ref}
      className={cn(
        "absolute right-1 flex h-6 w-6 items-center justify-center rounded-md text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2",
        showOnHover && "opacity-0",
        className
      )}
      {...props}
    />
  )
);
SidebarMenuAction.displayName = 'SidebarMenuAction';

// Menu badge component
const SidebarMenuBadge = React.forwardRef<View, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium text-sidebar-foreground",
        className
      )}
      {...props}
    />
  )
);
SidebarMenuBadge.displayName = 'SidebarMenuBadge';

// Simplified skeleton component
const Skeleton = ({ className, ...props }: ViewProps) => (
  <View
    className={cn("animate-pulse rounded-md bg-sidebar-border", className)}
    {...props}
  />
);

// Menu skeleton component
const SidebarMenuSkeleton = React.forwardRef<View, ViewProps & { showIcon?: boolean }>(
  ({ className, showIcon = false, ...props }, ref) => {
    // Random width between 50 to 90%
    const width = React.useMemo(() => {
      return `${Math.floor(Math.random() * 40) + 50}%`;
    }, []);
    
    return (
      <View
        ref={ref}
        className={cn("rounded-md h-8 flex flex-row gap-2 px-2 items-center", className)}
        {...props}
      >
        {showIcon && (
          <Skeleton
            className="h-4 w-4 rounded-md"
          />
        )}
        <Skeleton
          className="h-4 flex-1"
          style={{ width }}
        />
      </View>
    );
  }
);
SidebarMenuSkeleton.displayName = 'SidebarMenuSkeleton';

// Menu sub components
const SidebarMenuSub = React.forwardRef<View, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "mx-3.5 flex min-w-0 flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5",
        className
      )}
      {...props}
    />
  )
);
SidebarMenuSub.displayName = 'SidebarMenuSub';

const SidebarMenuSubItem = React.forwardRef<View, ViewProps>(
  ({ ...props }, ref) => <View ref={ref} {...props} />
);
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem';

interface SidebarMenuSubButtonProps extends PressableProps {
  size?: 'sm' | 'md';
  isActive?: boolean;
}

const SidebarMenuSubButton = React.forwardRef<Pressable, SidebarMenuSubButtonProps>(
  ({ size = 'md', isActive = false, className, children, ...props }, ref) => {
    return (
      <Pressable
        ref={ref}
        className={cn(
          "flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50",
          isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
          size === 'sm' && "text-xs",
          size === 'md' && "text-sm",
          className
        )}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text 
            className={cn(
              "truncate",
              isActive ? "font-medium" : "font-normal"
            )}
          >
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    );
  }
);
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton';

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
