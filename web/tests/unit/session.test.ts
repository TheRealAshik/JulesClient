import { describe, it, expect } from 'vitest';
import { sortSessions } from '../../utils/session';
import { JulesSession } from '../../types';

describe('sortSessions', () => {
    it('should sort by group priority first', () => {
        const sessions: JulesSession[] = [
            { name: 's1', prompt: 'Completed', state: 'COMPLETED', createTime: '2023-01-01' },
            { name: 's2', prompt: 'In Progress', state: 'IN_PROGRESS', createTime: '2023-01-01' },
            { name: 's3', prompt: 'Paused', state: 'PAUSED', createTime: '2023-01-01' },
            { name: 's4', prompt: 'Awaiting', state: 'AWAITING_PLAN_APPROVAL', createTime: '2023-01-01' },
        ];

        const sorted = sortSessions(sessions);
        const states = sorted.map(s => s.state);

        // Expected order groups:
        // 1: IN_PROGRESS
        // 2: AWAITING_PLAN_APPROVAL
        // 3: PAUSED
        // 4: COMPLETED
        expect(states).toEqual(['IN_PROGRESS', 'AWAITING_PLAN_APPROVAL', 'PAUSED', 'COMPLETED']);
    });

    it('should sort by priority second', () => {
        const sessions: JulesSession[] = [
            { name: 's1', prompt: 'Low', state: 'IN_PROGRESS', createTime: '2023-01-01', priority: 1 },
            { name: 's2', prompt: 'High', state: 'IN_PROGRESS', createTime: '2023-01-01', priority: 10 },
            { name: 's3', prompt: 'None', state: 'IN_PROGRESS', createTime: '2023-01-01' }, // undefined priority -> 0
        ];

        const sorted = sortSessions(sessions);
        const priorities = sorted.map(s => s.priority ?? 0);

        // Expected: 10, 1, 0
        expect(priorities).toEqual([10, 1, 0]);
    });

    it('should sort by updateTime third', () => {
        const sessions: JulesSession[] = [
            { name: 's1', prompt: 'Old', state: 'IN_PROGRESS', createTime: '2023-01-01', updateTime: '2023-01-01T10:00:00Z' },
            { name: 's2', prompt: 'New', state: 'IN_PROGRESS', createTime: '2023-01-01', updateTime: '2023-01-02T10:00:00Z' },
            { name: 's3', prompt: 'Middle', state: 'IN_PROGRESS', createTime: '2023-01-01', updateTime: '2023-01-01T12:00:00Z' },
            { name: 's4', prompt: 'No Update', state: 'IN_PROGRESS', createTime: '2023-01-01' }, // undefined updateTime -> 0
        ];

        const sorted = sortSessions(sessions);
        const names = sorted.map(s => s.name);

        // Expected: s2 (New), s3 (Middle), s1 (Old), s4 (No Update)
        expect(names).toEqual(['s2', 's3', 's1', 's4']);
    });

    it('should handle complex mixed sorting', () => {
        const sessions: JulesSession[] = [
            { name: 's1', prompt: 'Completed Old', state: 'COMPLETED', createTime: '2023-01-01', updateTime: '2023-01-01T10:00:00Z' },
            { name: 's2', prompt: 'In Progress New', state: 'IN_PROGRESS', createTime: '2023-01-01', updateTime: '2023-01-02T10:00:00Z' },
            { name: 's3', prompt: 'In Progress Old', state: 'IN_PROGRESS', createTime: '2023-01-01', updateTime: '2023-01-01T10:00:00Z' },
        ];

        const sorted = sortSessions(sessions);

        // s2 (Group 1, New), s3 (Group 1, Old), s1 (Group 4)
        expect(sorted.map(s => s.name)).toEqual(['s2', 's3', 's1']);
    });
});
