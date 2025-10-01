
import * as React from 'react';
import {
    View,
    Text,
    type ViewProps,
    type TextProps,
} from 'react-native';
import {
    Controller,
    ControllerProps,
    FieldPath,
    FieldValues,
    FormProvider,
    useFormContext,
} from 'react-hook-form';
import { cn } from '@/lib/utils';
// We replace the import of the web Label component with a basic Text component here.
// The actual Label component file will be fixed later.

const Form = FormProvider;

// --- FormField --- (No change needed for RN)
type FormFieldContextValue<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
    name: TName;
};
const FormFieldContext = React.createContext<FormFieldContextValue>(
    {} as FormFieldContextValue
);
const FormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
    ...props
}: ControllerProps<TFieldValues, TName>) => {
    return (
        <FormFieldContext.Provider value={{ name: props.name }}>
            <Controller {...props} />
        </FormFieldContext.Provider>
    );
};

// --- useFormField --- (Adapted for native IDs)
type FormItemContextValue = {
    id: string; // Use this base ID for generating nativeIDs
};
const FormItemContext = React.createContext<FormItemContextValue>(
    {} as FormItemContextValue
);
const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext);
    const itemContext = React.useContext(FormItemContext);
    const { getFieldState, formState } = useFormContext();

    const fieldState = getFieldState(fieldContext.name, formState);

    if (!fieldContext) {
        throw new Error('useFormField should be used within <FormField>');
    }
    if (!itemContext) {
        throw new Error('useFormField should be used within <FormItem>');
    }

    const { id } = itemContext;

    return {
        name: fieldContext.name,
        formItemId: `${id}-form-item`, // Base ID for the input component's nativeID
        formLabelId: `${id}-form-item-label`, // ID for the label's nativeID
        formDescriptionId: `${id}-form-item-description`, // ID for description's nativeID
        formMessageId: `${id}-form-item-message`, // ID for message's nativeID
        ...fieldState,
    };
};

// --- FormItem --- (Uses View)
const FormItem = React.forwardRef<View, ViewProps>(
    ({ className, ...props }, ref) => {
        const id = React.useId(); // Generate unique base ID for this item

        return (
            <FormItemContext.Provider value={{ id }}>
                <View ref={ref} className={cn('mb-4', className)} {...props} /> 
                {/* Replaced space-y-2 with margin-bottom (mb-4) for simplicity */}
            </FormItemContext.Provider>
        );
    }
);
FormItem.displayName = 'FormItem';

// --- FormLabel --- (Uses Text, sets nativeID)
const FormLabel = React.forwardRef<Text, TextProps>(
    ({ className, children, ...props }, ref) => {
        const { error, formLabelId } = useFormField();

        return (
            <Text
                ref={ref}
                nativeID={formLabelId} // Set nativeID for accessibility linking
                className={cn(
                    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                    error && 'text-destructive',
                    className
                )}
                {...props}
            >
                {children}
            </Text>
        );
    }
);
FormLabel.displayName = 'FormLabel';

// --- FormControl --- (Uses Fragment, delegates accessibility props)
// The actual input component (e.g., Input, Select) used inside FormControl
// should use useFormField() to get IDs and set nativeID and accessibilityDescribedBy.
const FormControl = React.forwardRef<
    View, // Ref type might need adjustment based on what it wraps
    ViewProps // Use ViewProps as a base, actual props depend on children
>(({ children, ...props }, ref) => {
    // Removed Slot and accessibility prop handling here.
    // Input components need to handle nativeID and accessibilityDescribedBy themselves.
    return <>{children}</>; // Render children directly
});
FormControl.displayName = 'FormControl';

// --- FormDescription --- (Uses Text, sets nativeID)
const FormDescription = React.forwardRef<Text, TextProps>(
    ({ className, children, ...props }, ref) => {
        const { formDescriptionId } = useFormField();

        return (
            <Text
                ref={ref}
                nativeID={formDescriptionId} // Set nativeID
                className={cn('text-sm text-muted-foreground', className)}
                {...props}
            >
                {children}
            </Text>
        );
    }
);
FormDescription.displayName = 'FormDescription';

// --- FormMessage --- (Uses Text, sets nativeID)
const FormMessage = React.forwardRef<Text, TextProps>(
    ({ className, children, ...props }, ref) => {
        const { error, formMessageId } = useFormField();
        const body = error ? String(error?.message) : children;

        if (!body) {
            return null;
        }

        return (
            <Text
                ref={ref}
                nativeID={formMessageId} // Set nativeID
                className={cn('text-sm font-medium text-destructive', className)}
                {...props}
            >
                {body}
            </Text>
        );
    }
);
FormMessage.displayName = 'FormMessage';

export {
    useFormField,
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
    FormField,
};

