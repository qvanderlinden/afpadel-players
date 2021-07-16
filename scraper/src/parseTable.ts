import puppeteer from 'puppeteer'

import {
    NEXT_PAGE_BUTTON_SELECTOR,
    NEXT_PAGES_BUTTON_SELECTOR,
    RANKINGS_TABLE_SELECTOR
} from './constants'
import Player from './Player'

const getTable = async (page: puppeteer.Page) => {
    const table = await page.$(RANKINGS_TABLE_SELECTOR)
    if (!table) {
        throw new Error(`Couldn't get the player rankings table`)
    }
    return table
}

const getAllElementHandlesInnerText = async (ehs: Array<puppeteer.ElementHandle>) => {
    const promises = ehs.map(eh => eh.evaluate((el: any) => el.innerText))
    const innerTexts = await Promise.all(promises)
    return innerTexts
}

const parse = async (page: puppeteer.Page) => {
    const table = await getTable(page)
    const headerItemsEH = await table.$x('./thead/tr/th')
    const headerItems = await getAllElementHandlesInnerText(headerItemsEH)
    const columns = headerItems.map(el => el.trim())

    let stop = false
    let pageCount = 0
    const allPlayers: Player[] = []
    while (!stop) {
        const table = await getTable(page)
        const playersEH = await table.$x('./tbody/tr')
        const pagePlayerProperties = await Promise.all(playersEH.map(async (playerEH) => {
            const playerPropertiesEH = await playerEH.$x('./td')
            const playerProperties = await getAllElementHandlesInnerText(playerPropertiesEH)
            return playerProperties
        }))
        const pagePlayers = pagePlayerProperties.map(pp => new Player(columns, pp))
        allPlayers.push(...pagePlayers)

        pageCount++
        console.log('%d pages scraped', pageCount)

        stop = await page.$(NEXT_PAGES_BUTTON_SELECTOR) === null
        if (!stop) {
            await page.click(NEXT_PAGE_BUTTON_SELECTOR)
            await page.waitForTimeout(1000)
        }
    }

    return allPlayers
}

export default parse