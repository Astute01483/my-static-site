const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true }); // Launch headless browser
  const page = await browser.newPage();

  // URL to clone
  const targetUrl = 'https://login.microsoftonline.com/';
  await page.goto(targetUrl, { waitUntil: 'networkidle2' });

  // Save the HTML of the page
  const htmlContent = await page.content();
  fs.writeFileSync('clonedPage.html', htmlContent);

  console.log('HTML saved as clonedPage.html');

  // Save all resources (CSS, JS, Images)
  const resourcesDir = path.resolve('./resources');
  if (!fs.existsSync(resourcesDir)) {
    fs.mkdirSync(resourcesDir);
  }

  page.on('response', async (response) => {
    try {
      const url = response.url();
      const contentType = response.headers()['content-type'];

      if (contentType && (contentType.includes('image') || contentType.includes('css') || contentType.includes('javascript'))) {
        const buffer = await response.buffer();
        const fileName = path.join(resourcesDir, path.basename(url.split('?')[0])); // Avoid query params in filenames
        fs.writeFileSync(fileName, buffer);
        console.log(`Resource saved: ${fileName}`);
      }
    } catch (error) {
      console.error(`Failed to save resource: ${response.url()} - ${error.message}`);
    }
  });

  // Workaround: Wait for a dummy selector to simulate a delay
  await page.waitForSelector('body', { timeout: 5000 }); // Wait for 5 seconds, body selector should exist

  console.log('Cloning complete!');
  await browser.close();
})();
