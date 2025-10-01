
import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { cn } from '@/lib/utils'; // Assuming this utility handles class names for React Native

// Define base and variant styles directly (alternative to cva)
const alertBaseClass = 'relative w-full rounded-lg border p-4';
const alertDefaultClass = 'bg-background border-border'; // Assuming border-border is defined in your theme
const alertDestructiveClass = 'border-destructive/50 text-destructive dark:border-destructive'; // Text color applied to children
const alertIconContainerClass = 'absolute left-4 top-4';
const alertContentContainerClass = 'pl-7'; // Adjust padding to accommodate icon
const alertTitleClass = 'mb-1 font-medium leading-none tracking-tight text-foreground'; // Apply text color directly
const alertDescriptionClass = 'text-sm text-foreground'; // Apply text color directly

// Define types for variants
type AlertVariant = 'default' | 'destructive';

interface AlertProps extends React.ComponentPropsWithoutRef<typeof View> {
  variant?: AlertVariant;
  children?: React.ReactNode;
}

const AlertContext = React.createContext<{ variant: AlertVariant }>({ variant: 'default' });

const Alert = React.forwardRef<View, AlertProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variantClass = variant === 'destructive' ? alertDestructiveClass : alertDefaultClass;

    // Separate icon from other children to apply specific layout
    let iconElement: React.ReactNode | null = null;
    const otherChildren: React.ReactNode[] = [];

    React.Children.forEach(children, (child) => {
      // A simple check - assumes the icon is a direct child and might be identifiable
      // A more robust approach might involve specific components like AlertIcon
      if (React.isValidElement(child) && (child.type as any)?.displayName?.includes('Icon')) { // Heuristic check
        iconElement = child;
      } else {
        otherChildren.push(child);
      }
    });

    return (
      <AlertContext.Provider value={{ variant }}>
        <View
          ref={ref}
          role="alert" // Accessibility role
          className={cn(alertBaseClass, variantClass, className)}
          {...props}
        >
          {iconElement && (
            <View className={cn(alertIconContainerClass,
                                variant === 'destructive' ? 'text-destructive' : 'text-foreground'
                               )}>
              {iconElement}
            </View>
          )}
          <View className={cn(iconElement ? alertContentContainerClass : '')}>
            {otherChildren}
          </View>
        </View>
      </AlertContext.Provider>
    );
  }
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  Text,
  React.ComponentPropsWithoutRef<typeof Text>
>(({ className, ...props }, ref) => {
    const { variant } = React.useContext(AlertContext);
    return (
        <Text
            ref={ref}
            className={cn(alertTitleClass,
                        variant === 'destructive' && 'text-destructive', // Apply variant color
                        className
                       )}
            {...props}
        />
    );
});
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  View, // Use View to contain potential <p> like elements if needed, or Text directly
  React.ComponentPropsWithoutRef<typeof View>
>(({ className, ...props }, ref) => {
    const { variant } = React.useContext(AlertContext);
    return (
        <View // Using View to mimic the div wrapper
            ref={ref}
            className={cn(alertDescriptionClass,
                         variant === 'destructive' && 'text-destructive', // Apply variant color
                        className
                        )}
            {...props}
        />
    );
});
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };

