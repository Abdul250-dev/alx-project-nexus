
import * as React from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    type ViewProps,
    type TextInputProps,
    Text,
    Pressable,
} from 'react-native';
import { Dot } from 'lucide-react-native'; // Use RN icon
import { cn } from '@/lib/utils';

interface InputOTPProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
    value?: string;
    onChange?: (value: string) => void;
    maxLength?: number; // Number of OTP slots
    containerClassName?: string;
    renderSeparator?: (index: number) => React.ReactNode;
    renderSlot?: (index: number, isFocused: boolean, value: string | undefined) => React.ReactNode;
}

const InputOTP = React.forwardRef<
    View, // Ref is on the container View
    InputOTPProps
>((
    {
        value = '',
        onChange,
        maxLength = 6,
        containerClassName,
        className, // Apply className to individual slots if needed
        renderSeparator,
        renderSlot,
        ...props // Pass remaining props like keyboardType to TextInput
    },
    ref
) => {
    const inputsRef = React.useRef<Array<TextInput | null>>([]);
    const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);

    React.useEffect(() => {
        // Ensure refs array has correct length
        inputsRef.current = inputsRef.current.slice(0, maxLength);
    }, [maxLength]);

    const handleInputChange = (text: string, index: number) => {
        const newValue = [...(value || '').split('')];
        newValue[index] = text;
        const nextValue = newValue.join('');

        onChange?.(nextValue.slice(0, maxLength));

        // Move focus to next input if a digit is entered
        if (text && index < maxLength - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (event: any, index: number) => {
        // Move focus to previous input on backspace if current input is empty
        if (event.nativeEvent.key === 'Backspace' && !value?.[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handleFocus = (index: number) => {
        setFocusedIndex(index);
    };

    const handleBlur = () => {
        setFocusedIndex(null);
    };

    const defaultRenderSlot = (index: number, isFocused: boolean, char: string | undefined) => (
        <View
            key={index}
            className={cn(
                'relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md',
                isFocused && 'z-10 ring-2 ring-ring ring-offset-background', // Note: ring styles need NativeWind/Tailwind setup
                className // Apply slot className
            )}
        >
            <Text className="text-sm text-foreground">{char || ''}</Text>
            {isFocused && (
                // Basic caret simulation (can be improved)
                <View style={styles.caret} />
            )}
        </View>
    );

    return (
        <View ref={ref} className={cn('flex flex-row items-center gap-2', containerClassName)}>
            {Array.from({ length: maxLength }).map((_, index) => (
                <React.Fragment key={index}>
                    {renderSeparator && index > 0 && renderSeparator(index)}
                    <TextInput
                        ref={(el) => (inputsRef.current[index] = el)}
                        value={value?.[index] || ''}
                        onChangeText={(text) => handleInputChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        onFocus={() => handleFocus(index)}
                        onBlur={handleBlur}
                        maxLength={1} // Each input takes one character
                        keyboardType={props.keyboardType || 'numeric'} // Default to numeric
                        style={styles.hiddenInput} // Hide the actual input
                        caretHidden // Hide default caret
                        selectTextOnFocus // Improve UX
                        {...props} // Pass other TextInput props
                    />
                    {/* Render the visible slot */}
                    <Pressable onPress={() => inputsRef.current[index]?.focus()}>
                        {renderSlot
                            ? renderSlot(index, focusedIndex === index, value?.[index])
                            : defaultRenderSlot(index, focusedIndex === index, value?.[index])}
                    </Pressable>
                </React.Fragment>
            ))}
        </View>
    );
});
InputOTP.displayName = 'InputOTP';

// --- Re-exporting other components as basic Views/Text or placeholders ---

const InputOTPGroup = React.forwardRef<View, ViewProps>(
    ({ className, ...props }, ref) => (
        <View ref={ref} className={cn('flex flex-row items-center', className)} {...props} />
    )
);
InputOTPGroup.displayName = 'InputOTPGroup';

// InputOTPSlot is handled by renderSlot prop in InputOTP now
const InputOTPSlot = () => null; // Placeholder, not used directly
InputOTPSlot.displayName = 'InputOTPSlot';

const InputOTPSeparator = React.forwardRef<View, ViewProps>(
    ({ className, ...props }, ref) => (
        <View ref={ref} role="separator" className={cn('mx-1', className)} {...props}>
            <Dot size={16} className="text-muted-foreground" />
        </View>
    )
);
InputOTPSeparator.displayName = 'InputOTPSeparator';

const styles = StyleSheet.create({
    hiddenInput: {
        width: 0,
        height: 0,
        position: 'absolute',
        opacity: 0,
    },
    caret: {
        position: 'absolute',
        width: 1,
        height: '60%', // Adjust height as needed
        backgroundColor: 'black', // Use theme foreground color
        // Add blinking animation if desired
    },
});

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };

