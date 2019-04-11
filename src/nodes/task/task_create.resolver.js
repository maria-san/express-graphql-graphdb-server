'use strict'

const { auth } = require('../../core/auth')

const task_create = async (_root, args, _ctx) => {

    const { token, start, end, subject, description } = args

    const user = await auth(token)

    const Task = require('./node')
    const task = new Task()

    const data = {
        start: start,
        end: end,
        status: 'PENDING',
        subject: subject,
        description: description,
    }

    const record = await task.create(data, user.id)

    return record

}

const resolver = {
    Mutation: {
        task_create
    }
}

module.exports = {
    resolver
}
