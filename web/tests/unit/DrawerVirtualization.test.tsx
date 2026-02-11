import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Drawer } from '../../components/Drawer';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { JulesSession, JulesSource } from '../../types';

// Mock AutoSizer to render with fixed dimensions in tests
vi.mock('react-virtualized-auto-sizer', () => ({
    AutoSizer: ({ children }: any) => children({ height: 600, width: 300 })
}));

const mockSessions: JulesSession[] = [
    {
        name: 'sessions/1',
        state: 'IN_PROGRESS',
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        prompt: 'First Session',
        title: 'Session One',
        // messages property removed or verified below
    },
    {
        name: 'sessions/2',
        state: 'IN_PROGRESS',
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        prompt: 'Second Session',
        title: 'Session Two',
    }
];

const mockSources: JulesSource[] = [
    {
        name: 'sources/1',
        displayName: 'Repo One',
        githubRepo: {
            owner: 'owner',
            repo: 'repo-one',
            isPrivate: false,
            defaultBranch: { displayName: 'main' },
        }
    }
];

describe('Drawer Virtualization', () => {
    it('renders session headers and items', () => {
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

        // Check for headers
        expect(screen.getByText('Recent sessions')).toBeInTheDocument();
        expect(screen.getByText('Repositories')).toBeInTheDocument();

        // Check for session items
        expect(screen.getByText('Session One')).toBeInTheDocument();
        expect(screen.getByText('Session Two')).toBeInTheDocument();

        // Check for source items
        expect(screen.getByText('Repo One')).toBeInTheDocument();
    });
});
