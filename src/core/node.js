'use strict'

const moment = require('moment')
const uuidv1 = require('uuid/v1')
const isNumeric = require('isnumeric')
const { validateAll, configure } = require('indicative')
const log = require('./log')

configure({ EXISTY_STRICT: true })

class Node {

    constructor(id = null) {

        this.label = this.__nodeLabel(this.constructor.name)
        this.id = id
        this.edges = {}
        this.page = null
        this.per_page = null
        this.rules = {
            create: {},
            update: {}
        }
        this.messages = {
            required: 'This field is required',
            min: 'This field is too short',
            email: 'Email should have a valid format'
        }

    }

    async get() {

        const query = `
            MATCH (node:${this.label} { ${this.__matchProperties({ id: this.id })} })
            RETURN node
        `
        const result = this.__hydrate(await this.__run(query), true)

        this.id = result.id

        return result
    }

    async all() {

        let pager = ''

        if (this.page !== null) {
            pager = `
                SKIP ${(this.page - 1) * this.per_page}
                LIMIT ${this.per_page}
            `
        }

        const query = `
            MATCH (node:${this.label})
            RETURN node
            ${this.__getSort()}
            ${pager}
        `

        const result = this.__hydrate(await this.__run(query))

        return result
    }

    async find(properties) {

        const query = `
            MATCH (node:${this.label} { ${this.__matchProperties(properties)} })
            RETURN node
        `
        const result = this.__hydrate(await this.__run(query))

        return result
    }

    async create(properties, user_id) {

        if (this.rules.create) {
            try {
                await validateAll(properties, this.rules.create, this.messages)
            } catch (err) {
                throw new Error(JSON.stringify(err))
            }
        }

        const now = moment().toISOString()

        if (!properties.id) {
            properties.id = uuidv1()
        }
        properties.created_at = now

        const query = `
            MERGE (node:${this.label} { ${this.__matchProperties(properties)} })
            RETURN node
        `
        const result = this.__hydrate(await this.__run(query), true)

        this.id = result.id

        if (user_id !== null) {
            await this.createEdge('created_by_user', user_id)
        }

        return result
    }

    async update(properties, user_id) {

        if (this.rules.update) {
            try {
                await validateAll(properties, this.rules.update, this.messages)
            } catch (err) {
                throw new Error(JSON.stringify(err))
            }
        }

        const now = moment().toISOString()

        properties.updated_at = now

        const query = `
            MATCH (node:${this.label} { ${this.__matchProperties({ id: this.id })} })
            SET node += { ${this.__matchProperties(properties)} }
            RETURN node
        `
        const result = this.__hydrate(await this.__run(query), true)

        await this.removeEdge('updated_by_user')
        await this.createEdge('updated_by_user', user_id)

        return result
    }

    async delete() {

        const query = `
            MATCH (node:${this.label} { ${this.__matchProperties({ id: this.id })} })
            DETACH DELETE node
            RETURN node
        `

        const result = await this.__run(query)

        if (result.records[0]) {
            if (result.records[0].length === 1) {
                return true
            }
        }

        return false
    }

    __edgeName(str) {
        return str.toUpperCase()
    }

    __getSort(key = 'node') {

        let sort = ''

        if (this.sort) {
            let sorts = []
            for (let property in this.sort) {
                sorts.push(`${key}.${property} ${this.sort[property]}`)
            }
            sort = `ORDER BY ${sorts.join(', ')}`
        }

        return sort
    }

    __hydrate(result, first = false, key = 'node') {

        let records = []
        result.records.forEach(record => {
            const properties = record.get(key).properties
            let props = {}
            for (let property in properties) {
                let value = properties[property]
                value = value === 'true' ? true : value
                value = value === 'false' ? false : value
                value = value === 'null' ? null : value
                props[property] = value
            }
            records.push(props)
        })
        return first ? records[0] : records
    }

    __matchProperties(properties) {

        let propArr = []
        for (let property in properties) {
            if (properties[property] !== undefined) {
                let prop = properties[property]
                if (isNumeric(prop)) {
                    propArr.push(`${property}: ${prop}`)
                } else {
                    propArr.push(`${property}: '${prop}'`)
                }
            }
        }
        return propArr.join(', ')
    }

    __mergeEdges() {
        this.edges.created_by_user = 'user'
        this.edges.updated_by_user = 'user'
    }

    __nodeLabel(str) {
        return str.toLowerCase().charAt(0).toUpperCase() + str.slice(1)
    }

    async createEdge(name, id, properties = {}) {

        this.__mergeEdges()

        const now = moment().toISOString()

        properties.created_at = properties.created_at || now

        const query = `
            MATCH (node:${this.label} { ${this.__matchProperties({ id: this.id })} }),
                  (related:${this.__nodeLabel(this.edges[name])} { ${this.__matchProperties({ id })} })
            MERGE (node)-[:${this.__edgeName(name)} { ${this.__matchProperties(properties)} }]->(related)
            RETURN node
        `

        const result = this.__hydrate(await this.__run(query), true)

        return result

    }

    async getEdge(name, mode = 'out', related = null, properties = null) {

        this.__mergeEdges()

        let edge = ''
        let nodeToReturn = null

        if (mode === 'in') {
            if (related) {
                const Node = require(`./../nodes/${related}/node.js`)
                const node = new Node()
                nodeToReturn = node
                if (node.edges[name]) {
                    edge = `<-[:${this.__edgeName(name)}]-`
                } else {
                    throw new Error('Edge not defined')
                }
            } else {
                throw new Error('Related node not defined')
            }
        } else if (mode === 'out') {
            if (this.edges[name]) {
                const Node = require(`./../nodes/${this.edges[name]}/node.js`)
                const node = new Node()
                nodeToReturn = node
                related = this.edges[name]
                edge = `-[:${this.__edgeName(name)}]->`
            } else {
                throw new Error('Edge not defined')
            }
        } else {
            throw new Error('Edge mode not defined')
        }

        properties = properties ? `{ ${this.__matchProperties(properties)} }` : ''

        let pager = ''

        if (this.page !== null) {
            pager = `
                SKIP ${(this.page - 1) * this.per_page}
                LIMIT ${this.per_page}
            `
        }

        const query = `
            MATCH (:${this.label} { ${this.__matchProperties({ id: this.id })} })
                  ${edge}
                  (node:${this.__nodeLabel(related)} ${properties})
            RETURN node
            ${nodeToReturn.__getSort()}
            ${pager}
        `

        const result = this.__hydrate(await this.__run(query))

        return result

    }

    async removeEdge(name, id = null) {

        this.__mergeEdges()

        let related = ''

        if (this.edges[name]) {
            related = this.edges[name]
        } else {
            throw new Error('Edge not defined')
        }

        const properties = id ? `{ ${this.__matchProperties({ id })} }` : ''

        const query = `
            MATCH (node:${this.label} { ${this.__matchProperties({ id: this.id })} })
                -[edge:${this.__edgeName(name)}]->
                (:${this.__nodeLabel(related)} ${properties})
            DELETE edge
            RETURN node
        `

        const result = this.__hydrate(await this.__run(query), true)

        return result

    }

    async query(query, log = true) {

        const result = await this.__run(query, log)
        return result
        
    }

    async __run(query, logToConsole = true) {

        try {
            const session = $.graph.session()
            const start = new Date().getTime()
            const result = await session.run(query)
            const end = new Date().getTime()
            if (logToConsole) {
                log.info(`[CYPHER] (${end - start}ms) ${query.replace(/\s\s+/g, ' ').trim()}`)
            }
            session.close()
            return result
        } catch (err) {
            log.warn(`[CYPHER] ${query.replace(/\s\s+/g, ' ').trim()}`)
            log.error(`[NEO4J] ${err.message}`)
            if (err.message.indexOf('ECONNREFUSED') > -1) {
                process.exit(1)
            }
            throw err
        }
    }

}

module.exports = Node
