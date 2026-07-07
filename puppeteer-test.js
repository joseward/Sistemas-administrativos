const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });

  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/login');
  
  // Login
  await page.type('input[type="email"]', 'admin@institutotech.edu');
  await page.type('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  console.log('Waiting for navigation to dashboard...');
  await page.waitForNavigation();
  
  console.log('Navigating to /grupos...');
  await page.goto('http://localhost:3000/grupos');
  
  // Wait a bit to catch errors
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
  console.log('Done.');
})();
