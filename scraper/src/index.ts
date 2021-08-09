import fs from "fs"
import path from "path"

import puppeteer from 'puppeteer'

import {
  AFPADEL_URL,
  MORE_MEN_BUTTON_SELECTOR,
  MORE_WOMEN_BUTTON_SELECTOR,
  MORE_MIXED_BUTTON_SELECTOR,
  OUTPUT_FOLDER,
  MEN_OUTPUT_FILE,
  WOMEN_OUTPUT_FILE,
  MIXED_OUTPUT_FILE,
  RANKINGS_BUTTON_SELECTOR,
} from './constants'
import parse from './parseTable'
import saveToFile from './saveToFile'
import { validate } from './validate'

const scrape = async () => {
  if (!fs.existsSync(OUTPUT_FOLDER)) {
    fs.mkdirSync(OUTPUT_FOLDER)
  }

  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 1600,
      height: 1600,
    },
    headless: false
  });
  
  await scrapeRankings({ 
    browser, 
    buttonId: MORE_MEN_BUTTON_SELECTOR,
    outputFilename: path.join(OUTPUT_FOLDER, MEN_OUTPUT_FILE)
  })
  await scrapeRankings({
    browser,
    buttonId: MORE_WOMEN_BUTTON_SELECTOR,
    outputFilename: path.join(OUTPUT_FOLDER, WOMEN_OUTPUT_FILE)
  })
  await scrapeRankings({
    browser,
    buttonId: MORE_MIXED_BUTTON_SELECTOR,
    outputFilename: path.join(OUTPUT_FOLDER, MIXED_OUTPUT_FILE)
  })
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

  if (!validate(outputFilename)) {
    throw new Error(`File ${outputFilename} did not pass validation`)
  }
}

scrape()
  .then(() => console.log("Scraping succeeded"))
  .catch(error => console.log("Scraping failed with following error: %s", error))
