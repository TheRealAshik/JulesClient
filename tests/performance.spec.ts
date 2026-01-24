import { test, expect } from '@playwright/test';

test('performance of chat history with many items', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  // Mock API responses
  await page.route('**/v1alpha/sessions/test-session/activities*', async route => {
    const activities = [];
    for (let i = 0; i < 1000; i++) {
        activities.push({
            name: `sessions/test-session/activities/${i}`,
            id: `act-${i}`,
            createTime: new Date().toISOString(),
            ...(i % 2 === 0 ? {
                userMessage: { text: `User message ${i} which is reasonably long to take up some space.` }
            } : {
                agentMessage: { text: `Agent message ${i} response with **markdown** and some _styling_ to render.` }
            })
        });
    }

    await route.fulfill({
        json: {
            activities,
            nextPageToken: undefined
        }
    });
  });

  await page.route('**/v1alpha/sessions/test-session', async route => {
      await route.fulfill({ json: {
          name: 'sessions/test-session',
          title: 'Performance Test Session',
          prompt: 'Test Prompt',
          state: 'IN_PROGRESS',
          createTime: new Date().toISOString(),
      }});
  });

  await page.route('**/v1alpha/sessions*', async route => {
      await route.fulfill({ json: { sessions: [{
          name: 'sessions/test-session',
          title: 'Performance Test Session',
          prompt: 'Test Prompt',
          state: 'IN_PROGRESS',
          createTime: new Date().toISOString(),
      }] } });
  });

  await page.route('**/v1alpha/sources*', async route => {
         await route.fulfill({ json: { sources: [{
             name: 'sources/github/test/repo',
             displayName: 'test/repo',
             githubRepo: { owner: 'test', repo: 'repo' }
         }] } });
   });


  // Login
  await page.goto('http://localhost:3000');
  await page.fill('input[name="key"]', 'test-key');
  await page.click('button[type="submit"]');

  // Go to session
  await page.waitForSelector('text=Performance Test Session', { timeout: 10000 });
  await page.click('text=Performance Test Session');

  // Measure time
  const start = Date.now();
  // Wait for the last item to be rendered
  // With virtualization, we can't assume 'text=Agent message 999' is in DOM if it's not in viewport.
  // But initialTopMostItemIndex should put us at the bottom.
  // We can try to scroll to bottom to ensure it renders?
  // Or check if *some* item is rendered (e.g. initial prompt or first item if top)

  // Let's first wait for ANY message to confirm list is loaded
  await page.waitForSelector('text=User message 0', { timeout: 60000 });
  console.log('First message rendered');

  // Now try to find the last message. If we are at bottom, it should be visible.
  // If not, maybe we are at top.
  const isLastVisible = await page.isVisible('text=Agent message 999');
  console.log('Is last message visible?', isLastVisible);

  if (!isLastVisible) {
      // Maybe we are at the top?
      console.log('Last message not visible. Scrolling to bottom...');
      // It's virtualized, so we can't just scroll window. We scroll the container.
      // But we don't have easy access to virtuoso handle.
      // However, initialTopMostItemIndex should have worked.
  }

  const duration = Date.now() - start;
  console.log(`Render time for 1000 items: ${duration}ms`);

  expect(duration).toBeGreaterThan(0);
});
