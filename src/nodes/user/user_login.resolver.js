'use strict'

const user_login = (_root, args, _ctx) =>

    new Promise((fullfill, reject) => {

        const { credential } = args

        const options = {
            method: 'GET',
            json: true,
            url: `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${credential}`
        }

        require('request')(options, (_error, response, body) => {

            console.log(response.statusCode + ' -----')

            if (parseInt(response.statusCode) !== 200) {
                reject(new Error('Invalid token'))
            }

            const User = require('./node')
            const user = new User()

            user.find({ email: body.email })
                .then(
                    result => {

                        console.log(result)

                        if (result.length !== 1) {
                            throw new Error('Invalid token')
                        }

                        const jwt = require('./../../core/jwt')

                        const payload = {
                            email: result[0].email
                        }

                        const token = jwt.sign(payload)

                        fullfill({
                            token,
                            user: result[0]
                        })

                    },
                    err => {
                        console.log(err)
                        throw err
                    }
                )
                .catch(err => reject(err))
        })
    })

const resolver = {
    Mutation: {
        user_login
    }
}

module.exports = {
    resolver
}