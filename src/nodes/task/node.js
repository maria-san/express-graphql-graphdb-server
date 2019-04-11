'use strict'

const Node = require('../../core/node')

class Task extends Node {

    constructor(id = null) {

        super(id)
        
        this.rules = {
            create: {
                start: 'required',
                end: 'required'
            },
            update: {
                start: 'min:1',
                end: 'min:1'
            }
        }

        this.sort = {
            start: 'ASC'
        }
    }

}

module.exports = Task
