'use strict'

const JWT = require('jsonwebtoken')

const { JWT_KEY } = require('./../config')

module.exports.sign = payload => JWT.sign(payload, JWT_KEY)
module.exports.verify = token => JWT.verify(token, JWT_KEY)
