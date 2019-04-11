'use strict'

const { auth } = require('../../core/auth')

const task = async (_root, args, _ctx) => {

    await auth(args.token)

    const Task = require('./node')
    const task = new Task(args.id)

    const record = await task.get()
    record.days = parseFloat(record.days)

    return record
}

const resolver = {
    Query: {
        task
    }
}

module.exports.resolver = resolver
