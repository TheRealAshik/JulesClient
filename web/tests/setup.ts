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
        List: ({ children, itemCount, itemData, rowProps, rowComponent, rowCount, items: propsItems, ...props }: any) => {
            const Component = children || rowComponent;
            const items = [];
            const _itemCount = itemCount !== undefined ? itemCount : (rowCount !== undefined ? rowCount : 0);

            let limit = _itemCount;
            if (rowProps && rowProps.items) {
               limit = Math.min(_itemCount, rowProps.items.length);
            } else if (itemData && itemData.sessions) {
               limit = Math.min(_itemCount, itemData.sessions.length);
            } else if (props.itemData && Array.isArray(props.itemData)) {
               limit = Math.min(_itemCount, props.itemData.length);
            }

            for (let i = 0; i < limit; i++) {
                const itemProps: any = {
                    key: `item-${i}`,
                    index: i,
                    style: {},
                    data: itemData || props.itemData,
                    ...rowProps
                };

                if (rowProps && rowProps.items) {
                    itemProps.items = rowProps.items;
                }

                items.push(React.createElement(Component, itemProps));
            }

            return React.createElement('div', { 'data-testid': 'react-window-list' }, items);
        }
    };
});
