'use strict'

const { auth } = require('../../core/auth')

const task_update = async (_root, args, _ctx) => {

    const { token, id, start, end, status, subject, description } = args

    const user = await auth(token)

    const Task = require('./node')
    const task = new Task(id)

    const data = {
        start: start,
        end: end,
        status: status,
        subject: subject,
        description: description,
    }

    const record = await task.update(data, user.id)

    return record
}

const resolver = {
    Mutation: {
        task_update
    }
}

module.exports = {
    resolver
}