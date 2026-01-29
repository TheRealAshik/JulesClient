import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { InputArea } from '../../components/InputArea';

// Mock Lucide icons to avoid rendering issues if any
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        Plus: () => <div data-testid="icon-plus" />,
        Rocket: () => <div data-testid="icon-rocket" />,
        ArrowRight: () => <div data-testid="icon-arrow-right" />,
        Check: () => <div data-testid="icon-check" />,
        Clock: () => <div data-testid="icon-clock" />,
        MessageSquare: () => <div data-testid="icon-message-square" />,
        FileSearch: () => <div data-testid="icon-file-search" />,
        Search: () => <div data-testid="icon-search" />,
        GitBranch: () => <div data-testid="icon-git-branch" />,
        ChevronDown: () => <div data-testid="icon-chevron-down" />,
        Type: () => <div data-testid="icon-type" />,
        Settings2: () => <div data-testid="icon-settings-2" />,
    };
});

describe('InputArea Component', () => {
    const mockOnSendMessage = vi.fn();

    it('should have accessible branch selector and settings buttons', () => {
        render(
            <InputArea
                onSendMessage={mockOnSendMessage}
                isLoading={false}
            />
        );

        // Click on the container to expand it (InputArea logic requires interaction or input to show controls)
        const input = screen.getByLabelText('Message input');
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: 'test' } });

        // Now the controls should be visible

        // Check for Branch Selector Button
        // Currently it doesn't have an aria-label, so this query should fail or we use getByRole with name if we added one.
        // The plan is to check if it HAS the label. Since I haven't added it yet, I expect this to fail if I use getByRole('button', { name: /select branch/i }).
        // But for "Red" phase, I write the test expecting the *correct* behavior.

        const branchButton = screen.getByLabelText('Select branch (current: main)');
        expect(branchButton).toBeInTheDocument();
        expect(branchButton).toHaveAttribute('aria-haspopup', 'true');
        expect(branchButton).toHaveAttribute('aria-expanded', 'false');

        // Check for Settings Button
        const settingsButton = screen.getByLabelText('Session settings');
        expect(settingsButton).toBeInTheDocument();
        expect(settingsButton).toHaveAttribute('aria-haspopup', 'true');
        expect(settingsButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should toggle aria-expanded when buttons are clicked', () => {
         render(
            <InputArea
                onSendMessage={mockOnSendMessage}
                isLoading={false}
            />
        );

        // Expand area
        const input = screen.getByLabelText('Message input');
        fireEvent.focus(input);
        fireEvent.change(input, { target: { value: 'test' } });

        // Branch Button Interaction
        const branchButton = screen.getByLabelText('Select branch (current: main)');
        fireEvent.click(branchButton);
        expect(branchButton).toHaveAttribute('aria-expanded', 'true');

        fireEvent.click(branchButton);
        expect(branchButton).toHaveAttribute('aria-expanded', 'false');

        // Settings Button Interaction
        const settingsButton = screen.getByLabelText('Session settings');
        fireEvent.click(settingsButton);
        expect(settingsButton).toHaveAttribute('aria-expanded', 'true');

        fireEvent.click(settingsButton);
        expect(settingsButton).toHaveAttribute('aria-expanded', 'false');
    });
});
