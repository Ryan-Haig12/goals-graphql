// util to determine if userJWT is an admin for the given groupId

const jwt = require('jsonwebtoken')
const { jwtsecret } = require('../config/keys')

module.exports = ( userJWT, groupCreator ) => {
    const decoded = jwt.verify(userJWT, jwtsecret)
    const isAdmin = groupCreator === decoded.user._id
    return isAdmin
}