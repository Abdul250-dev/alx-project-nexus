
import * as React from 'react';
import {
    View,
    StyleSheet,
    type ViewProps,
} from 'react-native';
import { GripVertical } from 'lucide-react-native'; // Use RN icon
import { cn } from '@/lib/utils';

// --- Placeholder Components ---
// NOTE: These are basic stubs replacing react-resizable-panels.
// The actual resizing functionality is removed.

interface ResizablePanelGroupProps extends ViewProps {
    direction: 'horizontal' | 'vertical';
    // Other props like autoSaveId, id, onLayout are omitted
}

const ResizablePanelGroup = React.forwardRef<View, ResizablePanelGroupProps>(
    ({ className, direction, children, ...props }, ref) => (
        <View
            ref={ref}
            className={cn(
                'flex h-full w-full',
                direction === 'vertical' ? 'flex-col' : 'flex-row',
                className
            )}
            {...props}
        >
            {children}
        </View>
    )
);
ResizablePanelGroup.displayName = 'ResizablePanelGroup';

interface ResizablePanelProps extends ViewProps {
    // Props like defaultSize, minSize, maxSize, id, order, collapsedSize, collapsible
    // are omitted as the resizing logic is removed.
    // Consumers will need to manage size via style (e.g., flex, width, height).
}

const ResizablePanel = React.forwardRef<View, ResizablePanelProps>(
    ({ className, children, ...props }, ref) => (
        <View
            ref={ref}
            className={cn(
                'flex-1', // Default to flex-1, allow override via style/className
                className
            )}
            {...props}
        >
            {children}
        </View>
    )
);
ResizablePanel.displayName = 'ResizablePanel';

interface ResizableHandleProps extends ViewProps {
    withHandle?: boolean;
    // Props like disabled, id, onDragging, onFocus, onBlur are omitted
}

const ResizableHandle = React.forwardRef<View, ResizableHandleProps>(
    ({ className, withHandle, ...props }, ref) => (
        <View
            ref={ref}
            // Removed complex data-attribute styling, focus rings
            className={cn(
                'relative flex items-center justify-center',
                // Basic styles mimicking the original appearance
                'w-px bg-border data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full',
                className
            )}
            {...props}
        >
            {withHandle && (
                <View className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border border-border bg-background">
                    <GripVertical size={10} className="text-muted-foreground" />
                </View>
            )}
        </View>
    )
);
ResizableHandle.displayName = 'ResizableHandle';

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };

