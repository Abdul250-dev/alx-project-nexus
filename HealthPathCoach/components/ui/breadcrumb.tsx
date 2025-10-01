
import * as React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type ViewProps,
  type TextProps,
  type PressableProps,
} from 'react-native';
import { ChevronRight, MoreHorizontal } from 'lucide-react-native'; // Use lucide-react-native
import { cn } from '@/lib/utils'; // Assuming this utility handles class names for React Native

// Breadcrumb container (replaces <nav>)
const Breadcrumb = React.forwardRef<
  View,
  ViewProps & { separator?: React.ReactNode }
>(({ className, children, separator = <BreadcrumbSeparator />, ...props }, ref) => {
  // Add separator between children
  const childrenWithSeparators = React.Children.toArray(children)
    .filter(Boolean)
    .map((child, index, array) => (
      <React.Fragment key={index}>
        {child}
        {index < array.length - 1 && separator}
      </React.Fragment>
    ));

  return (
    <View ref={ref} className={cn(className)} {...props}>
      {/* The BreadcrumbList should contain the items now */}
      {childrenWithSeparators}
    </View>
  );
});
Breadcrumb.displayName = 'Breadcrumb';

// Breadcrumb list container (replaces <ol>)
const BreadcrumbList = React.forwardRef<View, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      // Apply flex-wrap and gap using NativeWind classes
      className={cn(
        'flex-row flex-wrap items-center gap-1.5 sm:gap-2.5', // Adjusted gap classes
        className
      )}
      {...props}
    />
  )
);
BreadcrumbList.displayName = 'BreadcrumbList';

// Breadcrumb item container (replaces <li>)
const BreadcrumbItem = React.forwardRef<View, ViewProps>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      // Apply flex and gap using NativeWind classes
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    />
  )
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

// Breadcrumb link (replaces <a>)
const BreadcrumbLink = React.forwardRef<
  Pressable,
  PressableProps & { children?: React.ReactNode }
  // Removed asChild prop as Slot is not directly available/needed here
>(({ className, children, ...props }, ref) => {
  return (
    <Pressable
      ref={ref}
      // Removed hover state, apply transition-colors if supported by NativeWind
      className={cn('transition-colors', className)}
      {...props}
    >
      {/* Ensure children are Text if they are strings */}
      {typeof children === 'string' ? (
        <Text className="text-sm text-muted-foreground">{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
});
BreadcrumbLink.displayName = 'BreadcrumbLink';

// Breadcrumb current page text (replaces <span>)
const BreadcrumbPage = React.forwardRef<Text, TextProps>(
  ({ className, ...props }, ref) => (
    <Text
      ref={ref}
      role="link" // Accessibility role
      aria-disabled="true"
      aria-current="page"
      className={cn('font-normal text-sm text-foreground', className)} // Added text-sm
      {...props}
    />
  )
);
BreadcrumbPage.displayName = 'BreadcrumbPage';

// Breadcrumb separator (replaces <li> with icon)
const BreadcrumbSeparator = React.forwardRef<View, ViewProps>(
    ({ children, className, ...props }, ref) => (
    <View
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn('mx-1', className)} // Use margin instead of complex selectors
        {...props}
    >
        {children ?? <ChevronRight size={16} className="text-muted-foreground" />} {/* Use size prop and className */}
    </View>
));
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

// Breadcrumb ellipsis (replaces <span> with icon)
const BreadcrumbEllipsis = React.forwardRef<View, ViewProps>(
    ({ className, ...props }, ref) => (
    <View
        ref={ref}
        role="presentation"
        aria-hidden="true"
        className={cn('flex h-9 w-9 items-center justify-center', className)}
        {...props}
    >
        <MoreHorizontal size={16} className="text-muted-foreground" /> {/* Use size prop and className */}
        {/* <Text className="sr-only">More</Text> sr-only needs specific RN handling */}
    </View>
));
BreadcrumbEllipsis.displayName = 'BreadcrumbEllipsis';

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};

