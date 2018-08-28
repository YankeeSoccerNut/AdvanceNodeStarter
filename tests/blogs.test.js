const Page = require('./helpers/page')
let page;

// automatically runs before each test...note how we define variables above to extend scope to file
beforeEach(async () => {
    page = await Page.build()
    await page.goto("localhost:3000")
});

afterEach(async () => {
    await page.close()
});

test("Logged in user can see blog create form", async () => {
    await page.login()
    await page.click('a[href="/blogs/new"]')

    const label = await page.getContentsOf('form label')
    expect(label).toEqual("Blog Title")
});