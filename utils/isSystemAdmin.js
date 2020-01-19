// not sure why I need this anymore, building it anyway just in case
// and to get rid of this trello card

const jwt = require('jsonwebtoken')
const { jwtsecret } = require('../config/keys')

module.exports = ( userJWT ) => {
    const decoded = jwt.verify(userJWT, jwtsecret)

    return decoded.user.isSystemAdmin ? true : false
}