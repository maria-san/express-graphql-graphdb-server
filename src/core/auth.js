'use strict'

const jwt = require('./jwt')

const auth = async (token) => {

    try {
        const payload = jwt.verify(token)

        if (payload.email) {

            const User = require('./../nodes/user/node')
            const user = new User()
            const result = await user.find({
                email: payload.email
            })

            if (result.length === 1) {
                return result[0]
            } else {
                throw new Error('Invalid tokennnn')
            }

        } else {
            throw new Error('Invalid tokennnnnn')
        }

    } catch (err) {
        throw new Error('Invalid tokennnnnnnnnnn')
    }

}

module.exports = {
    auth
}
