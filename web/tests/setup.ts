import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // Deprecated
        removeListener: vi.fn(), // Deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock ResizeObserver
class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}
window.ResizeObserver = ResizeObserver;

// Mock ScrollTo
window.scrollTo = vi.fn();
Element.prototype.scrollTo = vi.fn();
Element.prototype.scrollIntoView = vi.fn();

// Mock react-markdown
vi.mock('react-markdown', () => {
    return {
        default: ({ children }: any) => React.createElement('div', { 'data-testid': 'react-markdown' }, children)
    };
});

// Mock AutoSizer
vi.mock('react-virtualized-auto-sizer', () => {
    return {
        AutoSizer: ({ children }: any) => children({ width: 800, height: 600 }),
        default: ({ children }: any) => children({ width: 800, height: 600 })
    };
});

// Mock react-window
vi.mock('react-window', async () => {
    const actual = await vi.importActual('react-window');
    return {
        ...actual,
        List: ({ children, itemCount, itemData, rowProps }: any) => {
            const items = [];
            // If itemData contains sessions (from RepositoryView)
            if (itemData && itemData.sessions) {
                const count = Math.min(itemCount, itemData.sessions.length);
                for (let i = 0; i < count; i++) {
                    items.push(children({ index: i, style: {}, data: itemData }));
                }
            }
            // If rowProps contains items (from Drawer)
            else if (rowProps && rowProps.items) {
                const count = Math.min(itemCount, rowProps.items.length);
                for (let i = 0; i < count; i++) {
                    items.push(children({ index: i, style: {}, data: itemData, ...rowProps, items: rowProps.items }));
                }
            }
            // Standard/fallback (like ChatHistory diff row)
            else {
                const count = Math.min(itemCount, 50);
                for (let i = 0; i < count; i++) {
                    items.push(children({ index: i, style: {}, data: itemData }));
                }
            }
            return React.createElement('div', { 'data-testid': 'react-window-list' }, items);
        }
    };
});
