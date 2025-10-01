
import * as React from 'react';
import {
    View,
    Text,
    Pressable,
    type ViewProps,
    type TextProps,
    type PressableProps,
} from 'react-native';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react-native'; // Use RN icons
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/components/ui/button'; // Import the fixed RN Button

// Pagination container (replaces <nav>)
const Pagination = React.forwardRef<View, ViewProps>(
    ({ className, ...props }, ref) => (
        <View
            ref={ref}
            // role="navigation" // Not directly applicable
            // aria-label="pagination" // Use accessibilityLabel
            accessibilityLabel="pagination"
            className={cn('mx-auto flex w-full justify-center', className)}
            {...props}
        />
    )
);
Pagination.displayName = 'Pagination';

// Pagination content container (replaces <ul>)
const PaginationContent = React.forwardRef<View, ViewProps>(
    ({ className, ...props }, ref) => (
        <View
            ref={ref}
            className={cn('flex flex-row items-center gap-1', className)}
            {...props}
        />
    )
);
PaginationContent.displayName = 'PaginationContent';

// Pagination item container (replaces <li>)
const PaginationItem = React.forwardRef<View, ViewProps>(
    ({ className, ...props }, ref) => (
        <View ref={ref} className={cn('', className)} {...props} />
    )
);
PaginationItem.displayName = 'PaginationItem';

// Pagination link (uses Button component)
type PaginationLinkProps = {
    isActive?: boolean;
    children?: React.ReactNode;
} & Pick<ButtonProps, 'size'> &
    PressableProps; // Use PressableProps for onPress etc.

const PaginationLink = ({
    className,
    isActive,
    size = 'icon',
    children,
    ...props
}: PaginationLinkProps) => (
    <Button
        variant={isActive ? 'outline' : 'ghost'}
        size={size}
        className={cn(className)}
        // aria-current={isActive ? 'page' : undefined} // Use accessibilityState
        accessibilityState={{ selected: isActive }}
        {...props} // Pass PressableProps like onPress
    >
        {/* Button handles Text children automatically */}
        {children}
    </Button>
);
PaginationLink.displayName = 'PaginationLink';

// Previous button
const PaginationPrevious = ({
    className,
    ...props
}: React.ComponentProps<typeof PaginationLink>) => (
    <PaginationLink
        accessibilityLabel="Go to previous page"
        size="default"
        className={cn('gap-1 pl-2.5', className)}
        {...props}
    >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <ChevronLeft size={16} className="text-current" />
            <Text>Previous</Text>
        </View>
    </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

// Next button
const PaginationNext = ({
    className,
    ...props
}: React.ComponentProps<typeof PaginationLink>) => (
    <PaginationLink
        accessibilityLabel="Go to next page"
        size="default"
        className={cn('gap-1 pr-2.5', className)}
        {...props}
    >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text>Next</Text>
            <ChevronRight size={16} className="text-current" />
        </View>
    </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

// Ellipsis indicator
const PaginationEllipsis = ({
    className,
    ...props
}: TextProps) => (
    <View
        // aria-hidden // Not directly applicable, ensure it's not focusable if needed
        className={cn('flex h-9 w-9 items-center justify-center', className)}
        {...props}
    >
        <MoreHorizontal size={16} className="text-muted-foreground" />
        {/* <Text className="sr-only">More pages</Text> // Use accessibilityLabel on parent? */}
    </View>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
};

