'use strict'

const scan = require('scan-dir-recursive/sync')
const path = require('path')

const { readFileSync, readdirSync, existsSync } = require('fs')
const { mergeResolvers, mergeTypes } = require('merge-graphql-schemas')
const { makeExecutableSchema } = require('graphql-tools')

const log = require('./log')


const getTypes = () => {

	const types = []

	readdirSync(`${__dirname}/../schema`)
		.forEach(file => {
            log.info(`... ${file.replace('.graphql', '')}`)
			const path = `${__dirname}/../schema/${file}`
			existsSync(path) && types.push(readFileSync(path, 'utf8'))
		})

	return mergeTypes(types)

}

const getResolvers = () => {

	const resolvers = []

	scan(`${__dirname}/../nodes`)
		.filter(file => file.endsWith('.resolver.js'))
		.forEach(file => {
            log.info(`... ${path.basename(file).replace('.resolver.js', '')}`)
			const { resolver } = require(file)
			resolvers.push(resolver)
		})

	return mergeResolvers(resolvers)

}

const buildSchema = () => {
    log.info('Building schema...')
    log.info('> Loading types...')
    const typeDefs = getTypes()
    log.info('> Loading resolvers...')
    const resolvers = getResolvers()
    log.info('> Merging...')
	const schema = makeExecutableSchema({
		typeDefs,
		resolvers
	})
	return schema
}

module.exports = {
	buildSchema
}
