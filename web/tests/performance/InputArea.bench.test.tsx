import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { InputArea } from '../../components/InputArea';
import { ArrowRight } from 'lucide-react';

// Mock lucide-react module
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        // @ts-ignore
        ...actual,
        // Mock ArrowRight with a spy function that calls the original component
        ArrowRight: vi.fn((props) => {
            return <div data-testid="arrow-right" {...props} />;
        }),
    };
});

describe('InputArea Performance Optimization', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        // Clear mock calls before each test
        vi.mocked(ArrowRight).mockClear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('does not re-render static children (ArrowRight) when placeholder updates', () => {
        render(
            <InputArea
                onSendMessage={() => {}}
                isLoading={false}
                currentSource={null}
            />
        );

        // Initial render
        expect(ArrowRight).toHaveBeenCalled();
        const initialRenderCount = vi.mocked(ArrowRight).mock.calls.length;
        console.log(`Initial ArrowRight Render Count: ${initialRenderCount}`);

        // Advance time by 3.5s (PLACEHOLDER_CYCLE_INTERVAL)
        act(() => {
            vi.advanceTimersByTime(3500);
        });

        // The placeholder hook fired inside InputTextarea.
        // InputTextarea re-renders.
        // InputArea (parent) should NOT re-render.
        // ArrowRight (child of InputArea) should NOT re-render.

        const countAfterFirstCycle = vi.mocked(ArrowRight).mock.calls.length;
        console.log(`ArrowRight Render Count after 3.5s: ${countAfterFirstCycle}`);

        expect(countAfterFirstCycle).toBe(initialRenderCount);

        // Advance another 3.5s
        act(() => {
            vi.advanceTimersByTime(3500);
        });

        const countAfterSecondCycle = vi.mocked(ArrowRight).mock.calls.length;
        console.log(`ArrowRight Render Count after 7s: ${countAfterSecondCycle}`);

        expect(countAfterSecondCycle).toBe(initialRenderCount);
    });
});
