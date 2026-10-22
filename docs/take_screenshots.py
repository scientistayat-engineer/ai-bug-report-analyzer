"""Capture UI screenshots with Playwright (run while the server is on :8000)."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path(__file__).parent / "screenshots"; OUT.mkdir(exist_ok=True)
URL = "http://127.0.0.1:8000"
BUG = ("Customers are being charged twice at checkout when they click the Pay button and the network is slow. "
       "Orders show duplicated payments in the billing dashboard.")

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1440, "height": 900})
        await pg.goto(URL); await pg.wait_for_timeout(800)
        await pg.screenshot(path=OUT/"01-home.png")
        await pg.locator("#analyzer").scroll_into_view_if_needed()
        await pg.evaluate("document.querySelector('#analyzer').scrollIntoView()")
        await pg.wait_for_timeout(300)
        await pg.screenshot(path=OUT/"02-analyzer-empty.png")
        await pg.set_viewport_size({"width":1440,"height":1180}); await pg.evaluate("document.querySelector('#analyzer').scrollIntoView()")
        await pg.fill("#bugInput", BUG); await pg.wait_for_timeout(200)
        await pg.click("#analyzeBtn"); await pg.wait_for_timeout(700)
        await pg.screenshot(path=OUT/"03-workflow-running.png")
        await pg.wait_for_selector("#result:not([hidden])"); await pg.wait_for_timeout(500)
        await pg.evaluate("document.querySelector('#analyzer').scrollIntoView()"); await pg.wait_for_timeout(200); await pg.screenshot(path=OUT/"04-report-result.png")
        await pg.click("[data-tab=markdown]"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=OUT/"05-markdown-tab.png")
        await pg.click("[data-tab=json]"); await pg.wait_for_timeout(200)
        await pg.screenshot(path=OUT/"06-json-tab.png")
        for sid, name in [("workflow","07-workflow-architecture"),("features","08-features"),("history","09-history")]:
            await pg.evaluate(f"document.querySelector('#{sid}').scrollIntoView()"); await pg.wait_for_timeout(300)
            await pg.screenshot(path=OUT/f"{name}.png")
        m = await b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        await m.goto(URL); await m.wait_for_timeout(600)
        await m.screenshot(path=OUT/"11-mobile-home.png")
        await b.close()
asyncio.run(main())
