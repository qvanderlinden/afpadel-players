import puppeteer from 'puppeteer'

import {
  AFPADEL_URL,
  MORE_MEN_BUTTON_SELECTOR,
  MORE_WOMEN_BUTTON_SELECTOR,
  MEN_OUTPUT_FILE,
  WOMEN_OUTPUT_FILE,
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
  
  await scrapeRankings({ browser, buttonId: MORE_MEN_BUTTON_SELECTOR, outputFilename: MEN_OUTPUT_FILE })
  await scrapeRankings({ browser, buttonId: MORE_WOMEN_BUTTON_SELECTOR, outputFilename: WOMEN_OUTPUT_FILE })
  await browser.close()
}

const scrapeRankings = async ({ browser, buttonId, outputFilename }: {
  browser: puppeteer.Browser,
  buttonId: string,
  outputFilename: string
}) => {
  const page = await browser.newPage();
  await page.goto(AFPADEL_URL);
  
  await page.waitForTimeout(3000)
  await page.waitForSelector(RANKINGS_BUTTON_SELECTOR)
  await page.click(RANKINGS_BUTTON_SELECTOR)
  
  await page.waitForTimeout(3000)
  await page.waitForSelector(buttonId)
  await page.click(buttonId)
  
  const players = await parse(page)
  await page.close()
  saveToFile(players, outputFilename)
}

scrape()
  .then(() => console.log("Scraping succeeded"))
  .catch(error => console.log("Scraping failed with following error: %s", error))
