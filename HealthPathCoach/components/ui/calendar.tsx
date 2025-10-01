
import React from 'react';
import DateTimePicker, {
    type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Platform, View, Text } from 'react-native';
import { cn } from '@/lib/utils'; // Keep for potential wrapper styling

// Note: This component replaces the highly styled react-day-picker
// with the native platform date/time picker.
// Styling is limited to the wrapper or how the picker is displayed (modal/inline).

export interface CalendarProps {
    value: Date;
    onChange: (event: DateTimePickerEvent, date?: Date) => void;
    mode?: 'date' | 'time' | 'datetime'; // 'datetime' is iOS only
    display?: 'default' | 'spinner' | 'calendar' | 'clock'; // Affects Android/iOS appearance
    minimumDate?: Date;
    maximumDate?: Date;
    className?: string; // For the wrapper View, if needed
    // Many props from react-day-picker (like classNames, showOutsideDays, components)
    // are not applicable here and are removed.
}

function Calendar({
    value,
    onChange,
    mode = 'date',
    display = 'default', // 'default' might show spinner or calendar based on OS/mode
    minimumDate,
    maximumDate,
    className,
    ...props // Pass other compatible props like testID
}: CalendarProps) {

    // The native picker might be rendered directly or triggered via a button.
    // This example renders it directly. Often, you'd have a button that sets
    // a state variable to true, which then renders the DateTimePicker.
    // When the user picks a date/time or dismisses, onChange is called,
    // and you'd hide the picker again.

    // For simplicity, this example shows it persistently.
    // In a real app, you'd likely control its visibility.

    return (
        <View className={cn(className)}> 
            <DateTimePicker
                testID="dateTimePicker" // Example prop
                value={value}
                mode={mode as any} // Cast needed as 'datetime' is iOS only
                display={display}
                onChange={onChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                // Add any other relevant props from @react-native-community/datetimepicker
                {...props}
            />
        </View>
    );
}

Calendar.displayName = 'Calendar';

export { Calendar };

