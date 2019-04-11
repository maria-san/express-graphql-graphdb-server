'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const graphqlHTTP = require('express-graphql')
const neo4j = require('neo4j-driver').v1
const log = require('./core/log')

const { buildSchema } = require('./core/buildSchema')
const { HTTP_PORT, NEO4J_HOST, NEO4J_USER, NEO4J_PASS } = require('./config')

class Server {

	constructor() {

		this.graph = neo4j.driver(
			NEO4J_HOST,
			neo4j.auth.basic(NEO4J_USER, NEO4J_PASS)
		)

		this.app = null
	}

	async start() {

		const schema = buildSchema()

		this.app = express()

		this.app.use(cors())
		this.app.use(bodyParser.json())

		this.app.use('/graph', graphqlHTTP({
			schema,
			graphiql: true,
			formatError: err => {
				log.error(err)
				return err
			}
		}))

		this.app.listen(HTTP_PORT, () => log.info(`[HTTP] Listening on port ${HTTP_PORT}`))
        
	}
}

module.exports = Server
