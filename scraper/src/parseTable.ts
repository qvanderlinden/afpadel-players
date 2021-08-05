import puppeteer from 'puppeteer'

import {
    NEXT_PAGE_BUTTON_SELECTOR,
    PAGES_DIV,
    RANKINGS_TABLE_SELECTOR
} from './constants'
import Player from './Player'

const getTable = async (page: puppeteer.Page) => {
    await page.waitForTimeout(3000)
    await page.waitForSelector(RANKINGS_TABLE_SELECTOR)
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

    let processedTablePageIndex = 0
    let stop = false
    const allPlayers: Player[] = []
    while (!stop) {
        await page.waitForSelector(PAGES_DIV)
        const tablePageElementHandles = await page.$$(PAGES_DIV)
        let currentPageIndex
        for (const tablePageElementHandle of tablePageElementHandles) {
            const classNameJSHandle = await tablePageElementHandle.getProperty('className')
            const className = await classNameJSHandle?.jsonValue()
            if (className === 'rgCurrentPage') {
                currentPageIndex = await tablePageElementHandle.evaluate(div => div.innerText)
                break
            }
        }
        
        console.log(currentPageIndex)

        if (currentPageIndex > processedTablePageIndex) {
            const table = await getTable(page)
            const playersEH = await table.$x('./tbody/tr')
            const pagePlayerProperties = await Promise.all(playersEH.map(async (playerEH) => {
                const playerPropertiesEH = await playerEH.$x('./td')
                const playerProperties = await getAllElementHandlesInnerText(playerPropertiesEH)
                return playerProperties
            }))
            const pagePlayers = pagePlayerProperties.map(pp => new Player(columns, pp))
            allPlayers.push(...pagePlayers)

            processedTablePageIndex = currentPageIndex
            console.log('%d pages scraped', processedTablePageIndex)
            
            const lastTablePageElementHandle = tablePageElementHandles[tablePageElementHandles.length - 1]
            const lastTablePageClassNameJSHandle = await lastTablePageElementHandle.getProperty('className')
            const lastTablePageClassName = await lastTablePageClassNameJSHandle?.jsonValue()
            stop = lastTablePageClassName === 'rgCurrentPage'
            if (!stop) {
                await page.click(NEXT_PAGE_BUTTON_SELECTOR)
            }
        }
    }

    return allPlayers
}

export default parse