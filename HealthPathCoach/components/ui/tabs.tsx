import * as React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, type ViewProps, type PressableProps } from 'react-native';
import { cn } from '@/lib/utils';

// Context to manage tab state
interface TabsContextProps {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextProps | null>(null);

const useTabsContext = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a <Tabs />');
  }
  return context;
};

// Root component
interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

const Tabs = ({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
}: TabsProps) => {
  // Handle controlled/uncontrolled state
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || '');
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = React.useCallback(
    (newValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(newValue);
      }
      onValueChange?.(newValue);
    },
    [isControlled, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      {children}
    </TabsContext.Provider>
  );
};

// TabsList component (horizontal container for triggers)
const TabsList = React.forwardRef<ScrollView, ViewProps & { horizontal?: boolean }>(
  ({ className, children, horizontal = true, ...props }, ref) => (
    <ScrollView
      ref={ref}
      horizontal={horizontal}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabsListContent}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </ScrollView>
  )
);
TabsList.displayName = 'TabsList';

// TabsTrigger component (tab button)
interface TabsTriggerProps extends PressableProps {
  value: string;
  disabled?: boolean;
}

const TabsTrigger = React.forwardRef<Pressable, TabsTriggerProps>(
  ({ className, value, disabled = false, children, style, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = useTabsContext();
    const isActive = selectedValue === value;

    return (
      <Pressable
        ref={ref}
        disabled={disabled}
        onPress={() => onValueChange(value)}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive, disabled }}
        style={({ pressed }) => [
          pressed && !disabled ? { opacity: 0.7 } : {},
          typeof style === 'function' ? style({ pressed }) : style,
        ]}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5",
          isActive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
          disabled && "opacity-50",
          className
        )}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text 
            className={cn(
              "text-sm font-medium",
              isActive ? "text-foreground" : "text-muted-foreground"
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
TabsTrigger.displayName = 'TabsTrigger';

// TabsContent component (content for selected tab)
interface TabsContentProps extends ViewProps {
  value: string;
  forceMount?: boolean;
}

const TabsContent = React.forwardRef<View, TabsContentProps>(
  ({ className, value, forceMount, children, ...props }, ref) => {
    const { value: selectedValue } = useTabsContext();
    const isSelected = selectedValue === value;

    if (!isSelected && !forceMount) {
      return null;
    }

    return (
      <View
        ref={ref}
        role="tabpanel"
        className={cn(
          "mt-2",
          isSelected ? "animate-in fade-in-0" : "animate-out fade-out-0",
          className
        )}
        aria-hidden={!isSelected}
        {...props}
      >
        {children}
      </View>
    );
  }
);
TabsContent.displayName = 'TabsContent';

const styles = StyleSheet.create({
  tabsListContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export { Tabs, TabsList, TabsTrigger, TabsContent };
