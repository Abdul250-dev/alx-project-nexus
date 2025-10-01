
import * as React from 'react';
import {
    View,
    FlatList,
    useWindowDimensions,
    type ViewProps,
    type FlatListProps,
} from 'react-native';
import { ArrowLeft, ArrowRight } from 'lucide-react-native'; // Use RN version
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Use RN version of Button

interface CarouselContextProps {
    currentIndex: number;
    itemWidth: number;
    itemHeight: number; // Added for vertical support if needed
    orientation: 'horizontal' | 'vertical';
    scrollToIndex: (index: number, animated?: boolean) => void;
    scrollPrev: () => void;
    scrollNext: () => void;
    canScrollPrev: boolean;
    canScrollNext: boolean;
    totalItems: number;
}

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
    const context = React.useContext(CarouselContext);
    if (!context) {
        throw new Error('useCarousel must be used within a <Carousel />');
    }
    return context;
}

interface CarouselProps<TItem> extends Omit<FlatListProps<TItem>, 'renderItem' | 'data'> {
    orientation?: 'horizontal' | 'vertical';
    data: TItem[];
    renderItem: (info: { item: TItem; index: number }) => React.ReactElement | null;
    // Add other FlatList props you might need like keyExtractor, etc.
}

const Carousel = React.forwardRef<
    FlatList,
    CarouselProps<any> // Use any for generic data type here
>((
    {
        orientation = 'horizontal',
        className,
        data,
        renderItem,
        style,
        ...props
    },
    ref // Forward ref to FlatList if needed, though direct manipulation is often via state/index
) => {
    const flatListRef = React.useRef<FlatList>(null);
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [totalItems, setTotalItems] = React.useState(data?.length ?? 0);

    React.useEffect(() => {
        setTotalItems(data?.length ?? 0);
    }, [data]);

    const itemWidth = windowWidth; // Assume full window width for simplicity
    const itemHeight = windowHeight; // Assume full window height for vertical

    const scrollToIndex = React.useCallback((index: number, animated = true) => {
        if (index >= 0 && index < totalItems) {
            flatListRef.current?.scrollToIndex({ index, animated });
            // Note: onViewableItemsChanged should ideally update currentIndex
            setCurrentIndex(index); // Update index optimistically
        }
    }, [totalItems]);

    const scrollPrev = React.useCallback(() => {
        scrollToIndex(currentIndex - 1);
    }, [currentIndex, scrollToIndex]);

    const scrollNext = React.useCallback(() => {
        scrollToIndex(currentIndex + 1);
    }, [currentIndex, scrollToIndex]);

    const canScrollPrev = currentIndex > 0;
    const canScrollNext = currentIndex < totalItems - 1;

    // Update current index based on viewable items
    const onViewableItemsChanged = React.useRef(({ viewableItems }: { viewableItems: Array<any> }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index ?? 0);
        }
    });

    const viewabilityConfig = React.useRef({ itemVisiblePercentThreshold: 50 });

    const contextValue = {
        currentIndex,
        itemWidth,
        itemHeight,
        orientation,
        scrollToIndex,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        totalItems,
    };

    return (
        <CarouselContext.Provider value={contextValue}>
            <View className={cn('relative', className)} style={style}>
                <FlatList
                    ref={flatListRef}
                    data={data}
                    renderItem={renderItem}
                    horizontal={orientation === 'horizontal'}
                    vertical={orientation === 'vertical'}
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged.current}
                    viewabilityConfig={viewabilityConfig.current}
                    keyExtractor={(item, index) => `carousel-item-${index}`}
                    // Ensure items take full width/height
                    style={{
                        width: orientation === 'horizontal' ? itemWidth : undefined,
                        height: orientation === 'vertical' ? itemHeight : undefined,
                    }}
                    {...props} // Pass remaining FlatList props
                />
                {/* Render children which might include Prev/Next buttons */}
                {/* Children now have access to useCarousel() context */}
                {props.children}
            </View>
        </CarouselContext.Provider>
    );
});
Carousel.displayName = 'Carousel';

// Wrapper for FlatList renderItem content to ensure proper sizing
const CarouselItem = React.forwardRef<View, ViewProps>(
    ({ className, style, ...props }, ref) => {
        const { orientation, itemWidth, itemHeight } = useCarousel();
        return (
            <View
                ref={ref}
                role="group"
                aria-roledescription="slide"
                className={cn(className)}
                style={[
                    { width: orientation === 'horizontal' ? itemWidth : '100%',
                      height: orientation === 'vertical' ? itemHeight : '100%' },
                    style
                ]}
                {...props}
            />
        );
    }
);
CarouselItem.displayName = 'CarouselItem';

// Previous Button
const CarouselPrevious = React.forwardRef<
    React.ElementRef<typeof Button>,
    React.ComponentProps<typeof Button>
>(({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();
    return (
        <Button
            ref={ref}
            variant={variant}
            size={size}
            className={cn(
                'absolute h-8 w-8 rounded-full z-10', // Added z-index
                orientation === 'horizontal'
                    ? 'left-2 top-1/2 -translate-y-4' // Adjusted positioning
                    : 'top-2 left-1/2 -translate-x-4 rotate-90',
                className
            )}
            disabled={!canScrollPrev}
            onPress={scrollPrev}
            {...props}
        >
            <ArrowLeft size={16} className="text-current" />
            {/* Removed sr-only text */}
        </Button>
    );
});
CarouselPrevious.displayName = 'CarouselPrevious';

// Next Button
const CarouselNext = React.forwardRef<
    React.ElementRef<typeof Button>,
    React.ComponentProps<typeof Button>
>(({ className, variant = 'outline', size = 'icon', ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();
    return (
        <Button
            ref={ref}
            variant={variant}
            size={size}
            className={cn(
                'absolute h-8 w-8 rounded-full z-10', // Added z-index
                orientation === 'horizontal'
                    ? 'right-2 top-1/2 -translate-y-4' // Adjusted positioning
                    : 'bottom-2 left-1/2 -translate-x-4 rotate-90',
                className
            )}
            disabled={!canScrollNext}
            onPress={scrollNext}
            {...props}
        >
            <ArrowRight size={16} className="text-current" />
            {/* Removed sr-only text */}
        </Button>
    );
});
CarouselNext.displayName = 'CarouselNext';

// Note: CarouselContent is effectively replaced by the FlatList within Carousel
// Exporting the main components
export {
    Carousel,
    CarouselItem,
    CarouselPrevious,
    CarouselNext,
    useCarousel, // Export hook for potential custom controls
};

