// fail a given test if it takes longer than the setTimeout
jest.setTimeout(10000)

require('../models/User')

const mongoose = require('mongoose')
const keys = require('../config/keys')

mongoose.Promise = global.Promise
mongoose.connect(keys.mongoURI, {
    useMongoClient: true
})