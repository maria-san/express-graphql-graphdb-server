'use strict'

const { auth } = require('../../core/auth')

const task_delete = async (_root, args, _ctx) => {

    const { token, id } = args

    await auth(token)

    const Task = require('./node')
    const task = new Task(id)

    const record = await task.delete()

    return record
}

const resolver = {
    Mutation: {
        task_delete
    }
}

module.exports = {
    resolver
}
