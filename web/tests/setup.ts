import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe(target: Element) {
    // Trigger immediately with mock size
    this.callback([
      {
        target,
        contentRect: {
          bottom: 600,
          height: 600,
          left: 0,
          right: 300,
          top: 0,
          width: 300,
          x: 0,
          y: 0,
          toJSON: () => {}
        },
        borderBoxSize: [],
        contentBoxSize: [],
        devicePixelContentBoxSize: []
      }
    ], this);
  }
  unobserve() {}
  disconnect() {}
};

// We don't need to mock react-virtualized-auto-sizer anymore since we don't use it
// But if other components used it, we might keep it.
// For now, I'll remove the previous mock or keep it if I didn't remove the import in other files?
// I removed it from Drawer.tsx.
