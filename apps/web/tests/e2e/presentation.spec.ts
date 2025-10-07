import { test, expect, type Page } from '@playwright/test';

/**
 * E2E Test: 3-Viewer Synchronization
 * 
 * Tests that multiple viewers stay in perfect sync when a presenter
 * advances slides.
 */

test.describe('3-Viewer Synchronization', () => {
  test('three viewers stay synchronized during presentation', async ({ browser }) => {
    // Create 4 browser contexts: 1 presenter + 3 viewers
    const presenterContext = await browser.newContext();
    const viewer1Context = await browser.newContext();
    const viewer2Context = await browser.newContext();
    const viewer3Context = await browser.newContext();

    const presenterPage = await presenterContext.newPage();
    const viewer1Page = await viewer1Context.newPage();
    const viewer2Page = await viewer2Context.newPage();
    const viewer3Page = await viewer3Context.newPage();

    try {
      // 1. Create a session
      const sessionId = `test-session-${Date.now()}`;
      const viewerToken = 'test-viewer-token';

      // 2. Load presenter page
      await presenterPage.goto(`/present/${sessionId}`);
      
      // Wait for presenter to connect
      await expect(presenterPage.locator('text=connected')).toBeVisible({ timeout: 10000 });

      // 3. Load viewer pages
      const viewerUrl = `/view/${sessionId}?t=${viewerToken}`;
      await Promise.all([
        viewer1Page.goto(viewerUrl),
        viewer2Page.goto(viewerUrl),
        viewer3Page.goto(viewerUrl),
      ]);

      // Wait for all viewers to connect
      await Promise.all([
        expect(viewer1Page.locator('text=Live')).toBeVisible({ timeout: 10000 }),
        expect(viewer2Page.locator('text=Live')).toBeVisible({ timeout: 10000 }),
        expect(viewer3Page.locator('text=Live')).toBeVisible({ timeout: 10000 }),
      ]);

      // 4. Start presentation from presenter
      await presenterPage.click('button:has-text("Start")');
      await presenterPage.waitForTimeout(200);

      // 5. Advance through slides multiple times
      for (let i = 0; i < 5; i++) {
        await presenterPage.click('button:has-text("Next")');
        await presenterPage.waitForTimeout(300); // Wait for sync
      }

      // 6. Verify all viewers are on the same slide
      // Check that the current slide ID matches across all viewers
      const viewer1SlideId = await getViewerSlideId(viewer1Page);
      const viewer2SlideId = await getViewerSlideId(viewer2Page);
      const viewer3SlideId = await getViewerSlideId(viewer3Page);

      expect(viewer1SlideId).toBe(viewer2SlideId);
      expect(viewer2SlideId).toBe(viewer3SlideId);

      // 7. Test backward navigation
      await presenterPage.click('button:has-text("Previous")');
      await presenterPage.waitForTimeout(300);

      const viewer1SlideIdAfterPrev = await getViewerSlideId(viewer1Page);
      const viewer2SlideIdAfterPrev = await getViewerSlideId(viewer2Page);
      const viewer3SlideIdAfterPrev = await getViewerSlideId(viewer3Page);

      expect(viewer1SlideIdAfterPrev).toBe(viewer2SlideIdAfterPrev);
      expect(viewer2SlideIdAfterPrev).toBe(viewer3SlideIdAfterPrev);

      // 8. Verify sync is maintained (all viewers should have same content)
      await presenterPage.click('button:has-text("Next")');
      await presenterPage.waitForTimeout(300);

      // All viewers should be showing the same content
      const viewer1Content = await getViewerContent(viewer1Page);
      const viewer2Content = await getViewerContent(viewer2Page);
      const viewer3Content = await getViewerContent(viewer3Page);

      expect(viewer1Content).toBe(viewer2Content);
      expect(viewer2Content).toBe(viewer3Content);

      console.log('✅ All 3 viewers stayed synchronized!');
    } finally {
      // Cleanup
      await presenterContext.close();
      await viewer1Context.close();
      await viewer2Context.close();
      await viewer3Context.close();
    }
  });

  test('viewer reconnects and recovers state after disconnect', async ({ browser }) => {
    const presenterContext = await browser.newContext();
    const viewerContext = await browser.newContext();

    const presenterPage = await presenterContext.newPage();
    const viewerPage = await viewerContext.newPage();

    try {
      const sessionId = `test-reconnect-${Date.now()}`;
      const viewerToken = 'test-viewer-token';

      // Start presenter
      await presenterPage.goto(`/present/${sessionId}`);
      await expect(presenterPage.locator('text=connected')).toBeVisible({ timeout: 10000 });

      // Start viewer
      await viewerPage.goto(`/view/${sessionId}?t=${viewerToken}`);
      await expect(viewerPage.locator('text=Live')).toBeVisible({ timeout: 10000 });

      // Advance slides
      await presenterPage.click('button:has-text("Start")');
      await presenterPage.waitForTimeout(200);
      
      for (let i = 0; i < 3; i++) {
        await presenterPage.click('button:has-text("Next")');
        await presenterPage.waitForTimeout(200);
      }

      const slideIdBeforeReconnect = await getViewerSlideId(viewerPage);

      // Simulate disconnect by reloading the page
      await viewerPage.reload();

      // Wait for reconnect
      await expect(viewerPage.locator('text=Live')).toBeVisible({ timeout: 15000 });

      // Check that state was recovered
      const slideIdAfterReconnect = await getViewerSlideId(viewerPage);
      expect(slideIdAfterReconnect).toBe(slideIdBeforeReconnect);

      console.log('✅ Viewer successfully reconnected and recovered state!');
    } finally {
      await presenterContext.close();
      await viewerContext.close();
    }
  });
});

/**
 * Helper: Get current slide ID from viewer debug panel
 */
async function getViewerSlideId(page: Page): Promise<string> {
  try {
    // Look in the debug panel for "Slide: slide-X"
    const debugText = await page.locator('text=/Slide:.*\\|/').textContent({ timeout: 5000 });
    const match = debugText?.match(/Slide:\s*([\w-]+)/);
    return match ? match[1] : 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Helper: Get a hash of visible content for comparison
 */
async function getViewerContent(page: Page): Promise<string> {
  try {
    // Get the background color which changes per slide
    const bgColor = await page.locator('div[class*="bg-"]').first().evaluate(
      (el) => window.getComputedStyle(el).backgroundColor
    );
    return bgColor || 'none';
  } catch {
    return 'none';
  }
}
