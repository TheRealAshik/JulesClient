from playwright.sync_api import sync_playwright
import time

def take_screenshot():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            page.goto("http://localhost:3000/")

            # Login if needed
            try:
                if page.is_visible("text=Welcome to Jules Client"):
                    page.fill("input", "sk-test-fake-key-12345")
                    page.click("button:has-text('Enter App')")
                    time.sleep(2)
            except:
                pass

            page.wait_for_selector("textarea", state="visible", timeout=10000)
            page.fill("textarea", "Checking performance...")
            time.sleep(1)
            page.screenshot(path="verification_final.png")
            print("Screenshot saved to verification_final.png")
        except Exception as e:
            print(e)
        finally:
            browser.close()

if __name__ == "__main__":
    take_screenshot()
