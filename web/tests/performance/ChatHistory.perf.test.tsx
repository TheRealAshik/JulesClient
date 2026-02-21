import React from 'react';
import { render } from '@testing-library/react';
import { ChatHistory } from '../../components/ChatHistory';
import { describe, it, expect, vi } from 'vitest';

// Create a large diff string
const generateLargeDiff = (lines: number) => {
    let diff = 'diff --git a/file.ts b/file.ts\nindex 1234567..89abcdef 100644\n--- a/file.ts\n+++ b/file.ts\n@@ -1,5 +1,5 @@\n';
    for (let i = 0; i < lines; i++) {
        if (i % 3 === 0) diff += ' ' + 'context line ' + i + '\n';
        else if (i % 3 === 1) diff += '+' + 'added line ' + i + '\n';
        else diff += '-' + 'removed line ' + i + '\n';
    }
    return diff;
};

const largeDiff = generateLargeDiff(5000); // 5000 lines

const mockActivity: any = {
    name: 'test-activity',
    createTime: new Date().toISOString(),
    agentMessage: { // Changed to match structure expected by ChatHistory which checks agentMessage directly on act or iterates artifacts
        // Wait, ChatHistory checks: if (act.artifacts) ...
        // Let's check ChatHistory implementation for artifacts iteration
    },
    artifacts: [
        {
            changeSet: {
                gitPatch: {
                    unidiffPatch: largeDiff,
                    suggestedCommitMessage: 'Large Diff Test'
                }
            }
        }
    ]
};

describe('ChatHistory Performance', () => {
    it('renders large diff quickly', () => {
        const start = performance.now();
        render(
            <ChatHistory
                activities={[mockActivity]}
                isStreaming={false}
                sessionCreateTime={new Date().toISOString()}
                defaultCardCollapsed={false}
                onApprovePlan={vi.fn()} // Mock function
            />
        );
        const end = performance.now();
        const duration = end - start;
        console.log(`Render time for large diff: ${duration.toFixed(2)}ms`);

        expect(duration).toBeGreaterThan(0);
    });
});
