
import * as React from 'react';
import {
    View,
    Image,
    Text,
    StyleSheet,
    type ViewProps,
    type ImageProps,
    type TextProps,
} from 'react-native';
import { cn } from '@/lib/utils';

interface AvatarProps extends ViewProps {
    // Add any specific props if needed
}

const Avatar = React.forwardRef<View, AvatarProps>(
    ({ className, style, ...props }, ref) => (
        <View
            ref={ref}
            className={cn(
                'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
                className
            )}
            style={style} // Ensure custom styles can be passed
            {...props}
        />
    )
);
Avatar.displayName = 'Avatar';

interface AvatarImageProps extends ImageProps {
    // Add onError handling if needed
}

const AvatarImage = React.forwardRef<Image, AvatarImageProps>(
    ({ className, style, ...props }, ref) => {
        // Basic image, assumes source is passed correctly
        // Error handling (to show fallback) would typically be managed
        // in the parent component using this, or via state within Avatar.
        return (
            <Image
                ref={ref}
                className={cn('aspect-square h-full w-full', className)}
                style={style}
                {...props}
            />
        );
    }
);
AvatarImage.displayName = 'AvatarImage';

interface AvatarFallbackProps extends ViewProps {
    children?: React.ReactNode; // Allow passing initials or custom fallback
}

const AvatarFallback = React.forwardRef<View, AvatarFallbackProps>(
    ({ className, children, style, ...props }, ref) => (
        <View
            ref={ref}
            className={cn(
                'flex h-full w-full items-center justify-center rounded-full bg-muted',
                className
            )}
            style={style}
            {...props}
        >
            {/* Render children (e.g., Text with initials) */}
            {children}
        </View>
    )
);
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };

