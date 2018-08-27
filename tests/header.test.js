const puppeteer = require("puppeteer");

let browser, page;

// automatically runs before each test...note how we define variables above to extend scope to file
beforeEach(async () => {
    browser = await puppeteer.launch({
        headless: false
    });
    page = await browser.newPage()
    await page.goto("localhost:3000")
});

afterEach(async () => {
    await browser.close()
});

test("Header has correct text", async () => {
    const text = await page.$eval("a.left.brand-logo", el => el.innerHTML)
    expect(text).toEqual("Blogster")
});

test("Clicking login starts oAuth flow", async () => {
    await page.click(".right a")

    const url = await page.url()
    expect(url).toMatch(/accounts\.google\.com/)
});

test('When signed in, shows logout button', async () => {
    const id = '5b7f2a36df35f2cb2e351873' // from mlab mongo db...a real user id
    const Buffer = require('safe-buffer').Buffer
    const sessionObject = {
        passport: {
            user: id
        }
    }
    const sessionString = Buffer.from(JSON.stringify(sessionObject))
        .toString('base64')

    const Keygrip = require('keygrip')
    const keys = require('../config/keys')
    const keygrip = new Keygrip([keys.cookieKey])
    const sig = keygrip.sign('session=' + sessionString)

    await page.setCookie({
        name: 'session',
        value: sessionString
    })
    await page.setCookie({
        name: 'session.sig',
        value: sig
    })

    await page.goto('localhost:3000')

    await page.waitFor('a[href="/auth/logout"]')
    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML)

    expect(text).toEqual('Logout')
})