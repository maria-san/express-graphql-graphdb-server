'use strict'

const moment = require('moment')

module.exports.info = message => {
    console.log(`${moment().toISOString()} > [INFO] ${message}`)
}

module.exports.warn = message => {
    console.log(`${moment().toISOString()} > [WARN] ${message}`)
}

module.exports.error = message => {
    console.log(`${moment().toISOString()} > [ERR!] ${message}`)
}