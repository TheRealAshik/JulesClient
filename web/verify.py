from playwright.sync_api import sync_playwright

if __name__ == "__main__":
  with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(record_video_dir="/home/jules/verification/video")
    page = context.new_page()
    try:
        page.goto("http://localhost:3000")

        # Fill login
        page.get_by_role("textbox").fill("test-key")
        page.get_by_role("button", name="Enter App").click()
        page.wait_for_timeout(2000)

        # Open Drawer
        page.get_by_role("button", name="Toggle sidebar").click()
        page.wait_for_timeout(1000)

        # Open Repo view
        try:
            page.get_by_text("jules-ui").first.click()
            page.wait_for_timeout(2000)
        except Exception as e:
            # Maybe there are no repositories visible? Let's take a screenshot.
            pass

        page.screenshot(path="/home/jules/verification/verification.png")
    finally:
      context.close()
      browser.close()
