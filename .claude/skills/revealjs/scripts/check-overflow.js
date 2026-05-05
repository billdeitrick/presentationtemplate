/** Checks reveal.js slides for content overflow using Playwright */
const { chromium } = require('@playwright/test');
const path = require('path');

async function checkSlideOverflow(url) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => typeof Reveal !== 'undefined' && Reveal.isReady());

  const results = await page.evaluate(() => {
    const allSlides = document.querySelectorAll('.slides > section, .slides > section > section');
    const slides = [];

    allSlides.forEach((slide, i) => {
      const isStackParent = slide.parentElement.classList.contains('slides') && slide.querySelector('section');
      if (isStackParent) return;

      const id = slide.id || `slide-${i}`;
      const scrollHeight = slide.scrollHeight;
      const scrollWidth = slide.scrollWidth;
      const clientHeight = slide.clientHeight;
      const clientWidth = slide.clientWidth;

      slides.push({
        index: i,
        id,
        hasOverflow: scrollHeight > clientHeight || scrollWidth > clientWidth,
        hasVerticalOverflow: scrollHeight > clientHeight,
        hasHorizontalOverflow: scrollWidth > clientWidth,
        dimensions: {
          scrollHeight, clientHeight, scrollWidth, clientWidth,
          verticalDiff: scrollHeight - clientHeight,
          horizontalDiff: scrollWidth - clientWidth
        }
      });
    });

    return slides;
  });

  await browser.close();
  return results;
}

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node check-overflow.js <url-or-path>');
    console.error('  node check-overflow.js http://127.0.0.1:8080/slides/index.html');
    console.error('  node check-overflow.js slides/index.html');
    process.exit(1);
  }

  // Accept either a URL or a file path
  const url = arg.startsWith('http') ? arg : `file://${path.resolve(arg)}`;

  console.log(`Checking slides for overflow: ${url}\n`);

  const results = await checkSlideOverflow(url);
  let hasAnyOverflow = false;

  for (const slide of results) {
    if (slide.hasOverflow) {
      hasAnyOverflow = true;
      console.log(`OVERFLOW: Slide ${slide.index} (${slide.id})`);
      if (slide.hasVerticalOverflow) {
        console.log(`  - Vertical: ${slide.dimensions.verticalDiff}px over (content: ${slide.dimensions.scrollHeight}px, container: ${slide.dimensions.clientHeight}px)`);
      }
      if (slide.hasHorizontalOverflow) {
        console.log(`  - Horizontal: ${slide.dimensions.horizontalDiff}px over (content: ${slide.dimensions.scrollWidth}px, container: ${slide.dimensions.clientWidth}px)`);
      }
    }
  }

  if (!hasAnyOverflow) {
    console.log('No overflow detected on any slides.');
  }

  console.log(`\nTotal slides checked: ${results.length}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
