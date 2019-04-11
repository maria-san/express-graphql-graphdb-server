'use strict'

const moment = require('moment')
const { auth } = require('../../core/auth')

const tasks = async (_root, args, _ctx) => {

    await auth(args.token)

    const Task = require('./node')
    const task = new Task()

    let records = []

    if (args.start) {
        const query = `
            MATCH (task:Task)
            WHERE task.start >= '${moment(args.start).startOf('day').toISOString()}'
            AND task.end <= '${moment(args.end).endOf('day').toISOString()}' 
            RETURN task
            ORDER BY task.start
        `

        const queryResult = await task.query(query)
        records = task.__hydrate(queryResult, false, 'task')

    } else {
        records = await task.all()
    }

    for (let i = 0; i < records.length; i++) {
        let record = new Task(records[i].id)
        records[i].days = parseFloat(records[i].days)
        records[i].user = await record.getEdge('created_by_user')
    }

    return records
}

const resolver = {
    Query: {
        tasks
    }
}

module.exports = {
    resolver
}