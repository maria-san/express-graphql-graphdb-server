'use strict'

const Api = require('./server')
global.$ = new Api()
$.start()
