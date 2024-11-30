import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

const COOKIES_PATH = path.resolve('./cookies.json');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyName = searchParams.get('companyName');
  const facetGeoRegion = searchParams.get('facetGeoRegion');
  const keywords = searchParams.get('keywords');

  if (!companyName || !facetGeoRegion || !keywords) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const targetUrl = `https://www.linkedin.com/company/${companyName}/people/?facetGeoRegion=${facetGeoRegion}&keywords=${keywords}`;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Use these for safe scraping environments
    });

    const page = await browser.newPage();

    // Check if cookies exist and reuse them
    let cookiesLoaded = false;
    try {
      const cookiesString = await fs.readFile(COOKIES_PATH, 'utf8');
      const cookies = JSON.parse(cookiesString);
      await page.setCookie(...cookies);
      cookiesLoaded = true;
    } catch {
      console.log('No cookies found. Logging in manually.');
    }

    // Navigate to LinkedIn
    await page.goto('https://www.linkedin.com', { waitUntil: 'networkidle2' });

    // Perform login if cookies are not loaded
    if (!cookiesLoaded) {
      await page.type('#session_key', 'your-email@example.com', { delay: 100 }); // Replace with your email
      await page.type('#session_password', 'your-password', { delay: 100 }); // Replace with your password

      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'networkidle2' });

      // Save cookies for future runs
      const cookies = await page.cookies();
      await fs.writeFile(COOKIES_PATH, JSON.stringify(cookies, null, 2));
      console.log('Cookies saved for future use.');
    }

    // Navigate to the target page
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });

    // Wait for the names to load
    await page.waitForSelector('li .org-people-profile-card__profile-info .lt-line-clamp--single-line');

    // Extract names and company positions
    const profiles = await page.evaluate(() => {
      const elements = Array.from(
        document.querySelectorAll('li .org-people-profile-card__profile-info')
      );
      return elements.slice(0, 10).map((el) => ({
        name: el.querySelector('.lt-line-clamp--single-line')?.textContent?.trim() || '',
        position: el.querySelector('.lt-line-clamp--multi-line')?.textContent?.trim() || '',
      }));
    });

    // Close the browser
    await browser.close();

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: 'Failed to scrape data' }, { status: 500 });
  }
}
