import type React from "react"
import { t } from "../services/localizationService"

// Helper function to get component display name
function getDisplayName<P>(WrappedComponent: React.ComponentType<P>) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

// Higher-order component to provide translation functionality
export function withTranslation<P extends object>(Component: React.ComponentType<P>): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props: P) => {
    // Pass the translation function as a prop
    return <Component {...props} t={t} />
  }
  // Set display name for better debugging
  WrappedComponent.displayName = `WithTranslation(${getDisplayName(Component)})`;
  return WrappedComponent;
}

// Type definition for components that use the withTranslation HOC
export type WithTranslationProps = {
  t: typeof t
}

