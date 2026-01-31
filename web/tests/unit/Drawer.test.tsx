import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Drawer } from '../../components/Drawer';
import { MemoryRouter } from 'react-router-dom';
import { JulesSession, JulesSource } from '../../types';
import React from 'react';
import '@testing-library/jest-dom';

const mockSessions: JulesSession[] = [
    { name: 'sessions/1', prompt: 'Fix bug', state: 'IN_PROGRESS', createTime: '2023-01-01T10:00:00Z' },
    { name: 'sessions/2', prompt: 'Add feature', state: 'COMPLETED', createTime: '2023-01-02T10:00:00Z' },
    { name: 'sessions/3', prompt: 'Refactor', state: 'QUEUED', createTime: '2023-01-03T10:00:00Z' }
];

const mockSources: JulesSource[] = [
    { name: 'sources/github/owner/repo1', displayName: 'owner/repo1' },
    { name: 'sources/github/owner/repo2', displayName: 'owner/repo2' }
];

describe('Drawer Component', () => {
    it('renders sessions and sources', async () => {
        render(
            <MemoryRouter>
                <Drawer
                    isOpen={true}
                    onClose={() => {}}
                    sessions={mockSessions}
                    sources={mockSources}
                    onSelectSession={() => {}}
                    onSelectSource={() => {}}
                />
            </MemoryRouter>
        );

        // Check if sessions are rendered
        // We use findByText to wait for the useEffect to set isRendered=true
        expect(await screen.findByText('Fix bug')).toBeInTheDocument();
        expect(screen.getByText('Add feature')).toBeInTheDocument();

        // Check if sources are rendered
        expect(screen.getByText('owner/repo1')).toBeInTheDocument();
    });

    it('filters sessions based on search query', async () => {
        render(
            <MemoryRouter>
                <Drawer
                    isOpen={true}
                    onClose={() => {}}
                    sessions={mockSessions}
                    sources={mockSources}
                    onSelectSession={() => {}}
                    onSelectSource={() => {}}
                />
            </MemoryRouter>
        );

        const searchInput = await screen.findByPlaceholderText('Search repositories & sessions...');

        // Type 'Fix'
        fireEvent.change(searchInput, { target: { value: 'Fix' } });

        // Should show 'Fix bug'
        expect(screen.getByText('Fix bug')).toBeInTheDocument();

        // Should NOT show 'Add feature'
        expect(screen.queryByText('Add feature')).not.toBeInTheDocument();
    });
});
