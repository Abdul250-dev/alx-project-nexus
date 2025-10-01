
import React from 'react';
import { View, type ViewProps } from 'react-native';

// Placeholder component for Sonner Toaster
// Does not provide any toast functionality.
// A React Native toast solution (e.g., react-native-toast-message)
// needs to be implemented separately.

const Toaster = (props: ViewProps) => {
  // This component currently renders nothing.
  // It serves only to resolve the import error for 'sonner'.
  // You'll need to integrate a React Native toast library elsewhere.
  console.warn('Placeholder <Toaster /> component rendered. Implement React Native toasts.');
  return null; // Or <View {...props} /> if it needs to occupy space
};

Toaster.displayName = 'ToasterPlaceholder';

export { Toaster };

