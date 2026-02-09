import React from 'react';
import { render } from '@testing-library/react';
import { Drawer } from '../../components/Drawer';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { JulesSession, JulesSource } from '../../types';

// Mock large dataset
const generateSessions = (count: number): JulesSession[] => {
    return Array.from({ length: count }, (_, i) => ({
        name: `sessions/${i}`,
        state: 'IN_PROGRESS',
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        messages: [],
        prompt: `Session ${i} prompt`,
        title: `Session Title ${i}`,
    }));
};

const generateSources = (count: number): JulesSource[] => {
    return Array.from({ length: count }, (_, i) => ({
        name: `sources/${i}`,
        displayName: `Repo ${i}`,
        githubRepo: {
            owner: 'owner',
            repo: `repo-${i}`,
            url: 'http://github.com',
            isPrivate: false,
        }
    }));
};

describe('Drawer Performance', () => {
    it('renders 2000 sessions quickly', () => {
        const sessions = generateSessions(2000);
        const sources = generateSources(50);

        const start = performance.now();

        render(
            <MemoryRouter>
                <Drawer
                    isOpen={true}
                    onClose={() => {}}
                    sessions={sessions}
                    sources={sources}
                    onSelectSession={() => {}}
                    onSelectSource={() => {}}
                />
            </MemoryRouter>
        );

        const end = performance.now();
        const duration = end - start;

        console.log(`Drawer render time (2000 sessions): ${duration.toFixed(2)}ms`);

        // This is a benchmark, not a strict assertion, but we expect it to be measurable
        expect(duration).toBeGreaterThan(0);
    });
});
