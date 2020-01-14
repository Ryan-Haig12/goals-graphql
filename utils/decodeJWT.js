const jwt = require('jsonwebtoken')
const { jwtsecret } = require('../config/keys')

module.exports = ( userJWT ) => {
    if(!userJWT) {
        return {
            status: 'error',
            msg: 'You must be authed to use this endpoint'
        }
    }

    const decoded = jwt.verify(userJWT, jwtsecret)
    return decoded.user
}