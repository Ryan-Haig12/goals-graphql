const User = require('../mongooseDataModels/User')

const { createUser, getUser, loginUser, deleteUser } = require('./auth')

const resolvers = {
    Query: {

        getUser: async (parent, args, ctx, info) => {

            const data = await User.find({ name: args.name })
            const { _id, name, email, password } = data[0]

            return {
                id: _id,
                name,
                email,
                password
            }
        },

        createUser,
        getUser,
        loginUser,
        deleteUser
    }
}

module.exports = resolvers