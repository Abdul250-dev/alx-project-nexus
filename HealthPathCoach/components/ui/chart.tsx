
import React from 'react';
import {
    View,
    Text,
    Dimensions,
    StyleSheet,
    type ViewProps,
} from 'react-native';
import {
    LineChart,
    // Import other chart types like BarChart, PieChart etc. as needed
} from 'react-native-chart-kit';
import { cn } from '@/lib/utils'; // Assuming this utility handles class names for React Native

// NOTE: This is a simplified replacement for the original recharts-based component.
// It provides a basic LineChart wrapper using react-native-chart-kit.
// The complex configuration, theming, tooltip, and legend features of the original
// are NOT replicated here.
// Usage of this component will likely need to be adapted in the screens/components
// where it is imported.

export interface ChartKitData {
    labels: string[];
    datasets: Array<{
        data: number[];
        color?: (opacity: number) => string; // Optional color function
        strokeWidth?: number; // Optional stroke width
    }>;
    legend?: string[]; // Optional legend
}

export interface ChartContainerProps extends ViewProps {
    // Data format specific to react-native-chart-kit LineChart
    data: ChartKitData;
    width?: number;
    height?: number;
    // Configuration options for react-native-chart-kit LineChart
    chartConfig?: {
        backgroundColor?: string;
        backgroundGradientFrom?: string;
        backgroundGradientTo?: string;
        decimalPlaces?: number;
        color: (opacity: number) => string;
        labelColor?: (opacity: number) => string;
        style?: object;
        propsForDots?: object;
        propsForBackgroundLines?: object;
        propsForLabels?: object;
    };
    bezier?: boolean;
    // Add other props from react-native-chart-kit LineChart as needed
}

const defaultChartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 2, // optional, defaults to 2dp
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Black color default
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
        borderRadius: 16,
    },
    propsForDots: {
        r: '6',
        strokeWidth: '2',
        stroke: '#ffa726',
    },
};

const ChartContainer = React.forwardRef<
    View, // Ref is on the container View
    ChartContainerProps
>((
    {
        className,
        data,
        width = Dimensions.get('window').width - 16, // Default width
        height = 220, // Default height
        chartConfig = defaultChartConfig,
        bezier = false,
        style,
        ...props
    },
    ref
) => {

    // Basic validation
    if (!data || !data.labels || !data.datasets) {
        console.error("ChartContainer: Invalid data provided.");
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Invalid Chart Data</Text>
            </View>
        );
    }

    return (
        <View ref={ref} className={cn('my-4', className)} style={style} {...props}>
            <LineChart
                data={data}
                width={width}
                height={height}
                chartConfig={chartConfig}
                bezier={bezier}
                style={chartConfig.style}
                // Add other react-native-chart-kit props here if needed
                // e.g., yAxisLabel, yAxisSuffix, withHorizontalLabels, etc.
            />
        </View>
    );
});

ChartContainer.displayName = 'ChartContainer';

// Basic styles for error display
const styles = StyleSheet.create({
    errorContainer: {
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fee2e2', // Light red background
        borderRadius: 8,
        padding: 16,
        marginVertical: 16,
    },
    errorText: {
        color: '#b91c1c', // Dark red text
        fontWeight: 'bold',
    },
});

// Export the simplified container. Tooltip and Legend components from the original
// are not exported as react-native-chart-kit handles these differently (or they need
// custom implementation).
export {
    ChartContainer,
    // Export types if needed elsewhere
    // type ChartKitData,
    // type ChartContainerProps,
};

