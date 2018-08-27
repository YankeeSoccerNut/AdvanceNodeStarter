const Buffer = require('safe-buffer').Buffer
const Keygrip = require('keygrip')
const keys = require('../../config/keys')
const keygrip = new Keygrip([keys.cookieKey])

module.exports = (user) => {
    const sessionObject = {
        passport: {
            user: user._id.toString()
        }
    }
    const session = Buffer.from(JSON.stringify(sessionObject))
        .toString('base64')

    const sig = keygrip.sign('session=' + session)

    // note es2015 shortcut...when key and value have same name then just use key
    return {
        session,
        sig
    }
}