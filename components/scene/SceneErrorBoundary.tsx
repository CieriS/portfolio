'use client';

import { Component, type ReactNode } from 'react';

/**
 * The canvas is decoration: it lives in the root layout, above every view, so an
 * uncaught throw there would escalate to the global error page and take the whole
 * site with it. WebGL context creation fails for real reasons — GPU blocklists,
 * `webgl.disabled`, old devices, too many live contexts — so the scene is allowed
 * to fail and disappear, and nothing else changes.
 */
export class SceneErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
