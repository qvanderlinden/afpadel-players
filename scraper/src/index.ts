import puppeteer from 'puppeteer'

import {
  AFPADEL_URL,
  MORE_MEN_BUTTON_SELECTOR,
  OUTPUT_FILE,
  RANKINGS_BUTTON_SELECTOR,
} from './constants'
import parse from './parseTable'
import saveToFile from './saveToFile'

const scrape = async () => {
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 1600,
      height: 1600,
    },
    headless: false
  });
  const page = await browser.newPage();
  await page.goto(AFPADEL_URL);
  
  await page.waitForTimeout(3000)
  await page.waitForSelector(RANKINGS_BUTTON_SELECTOR)
  await page.click(RANKINGS_BUTTON_SELECTOR)
  
  await page.waitForTimeout(3000)
  await page.waitForSelector(MORE_MEN_BUTTON_SELECTOR)
  await page.click(MORE_MEN_BUTTON_SELECTOR)
  
  const players = await parse(page)
  // saveToFile(players, OUTPUT_FILE)
}

scrape()
  .then(() => console.log("Scraping succeeded"))
  .catch(error => console.log("Scraping failed with following error: %s", error))
