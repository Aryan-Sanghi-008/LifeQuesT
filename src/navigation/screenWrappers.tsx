import React from "react";
import { GameErrorBoundary } from "@components/GameErrorBoundary";

export function withGameErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
): React.ComponentType<Record<string, unknown>> {
  function Wrapped(props: P) {
    return (
      <GameErrorBoundary>
        <Component {...props} />
      </GameErrorBoundary>
    );
  }
  Wrapped.displayName = `WithGameErrorBoundary(${Component.displayName ?? Component.name ?? "Screen"})`;
  return Wrapped as React.ComponentType<Record<string, unknown>>;
}
