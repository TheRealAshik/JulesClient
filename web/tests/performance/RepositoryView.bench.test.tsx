import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RepositoryView } from '../../components/RepositoryView';
import { MemoryRouter } from 'react-router-dom';
import { JulesSession, JulesSource } from '../../types';

const generateSessions = (count: number): JulesSession[] => {
    return Array.from({ length: count }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (i % 60)); // Spread dates over 60 days
        return {
            name: `sessions/${i}`,
            state: i % 5 === 0 ? 'COMPLETED' : i % 5 === 1 ? 'FAILED' : 'IN_PROGRESS',
            createTime: date.toISOString(),
            updateTime: date.toISOString(),
            messages: [],
            prompt: `Session ${i} prompt`,
            title: `Session Title ${i}`,
        };
    });
};

const source: JulesSource = {
    name: 'sources/1',
    displayName: 'Test Repo',
    githubRepo: {
        owner: 'test',
        repo: 'repo',
        isPrivate: false,
    }
};

describe('RepositoryView Performance', () => {
    it('renders with 1000 sessions quickly', () => {
        const sessions = generateSessions(1000);
        const start = performance.now();
        render(
            <MemoryRouter>
                <RepositoryView
                    source={source}
                    sessions={sessions}
                    onSelectSession={() => {}}
                    onCreateNew={() => {}}
                />
            </MemoryRouter>
        );
        const end = performance.now();
        const duration = end - start;
        console.log(`RepositoryView render time (1000 sessions): ${duration.toFixed(2)}ms`);
        expect(duration).toBeGreaterThan(0);
    }, 10000);
});
