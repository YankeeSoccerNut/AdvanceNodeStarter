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

describe('When logged in', async () => {
    beforeEach(async () => {
        await page.login()
        await page.click('a[href="/blogs/new"]')
    })

    test("User can see the blog create form", async () => {
        const label = await page.getContentsOf('form label')
        expect(label).toEqual("Blog Title")
    })

    describe('And using INVALID form inputs', async () => {
        beforeEach(async () => {
            await page.click('form button')
        })
        test('the form shows an error message', async () => {
            const titleError = await page.getContentsOf('.title .red-text')
            const contentError = await page.getContentsOf('.content .red-text')

            expect(titleError).toEqual('You must provide a value')
            expect(contentError).toEqual('You must provide a value')
        })
    })

    describe('And using VALID form inputs', async () => {
        beforeEach(async () => {
            await page.type('.title input', 'My Testing Title')
            await page.type('.content input', 'My Testing Content')
            await page.click('form button')
        })
        test('submitting the form takes the user to review screen', async () => {
            const text = await page.getContentsOf('form h5')
            expect(text).toEqual('Please confirm your entries')
        })
        test('submitting then saving adds blog to the index', async () => {
            await page.click('button.green')
            await page.waitFor('.card')

            const title = await page.getContentsOf('.card-title')
            const content = await page.getContentsOf('p')

            expect(title).toEqual('My Testing Title')
            expect(content).toEqual('My Testing Content')
        })

    })

})

describe('When user is not logged in', async () => {
    test('User cannot create a blog post', async () => {
        const result = await page.evaluate(
            () => {
                return fetch('/api/blogs', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: 'My Title',
                        content: 'My Content'
                    })
                }).then(res => res.json())
            }
        )
        expect(result).toEqual({
            error: 'You must log in!'
        })
    })
    test('User cannot get a list of blog posts', async () => {
        const result = await page.evaluate(
            () => {
                return fetch('/api/blogs', {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                }).then(res => res.json())
            }
        )
        expect(result).toEqual({
            error: 'You must log in!'
        })
    })
})