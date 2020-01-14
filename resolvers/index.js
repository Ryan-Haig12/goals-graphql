const { createUser, getUser, loginUser, deleteUser, updateUser } = require('./user')
const { createGoal, updateGoal, deleteGoal } = require('./goals')
const { createGroup } = require('./group')

const resolvers = {
    Query: {
        getUser,
        loginUser,
    },

    Mutation: {
        createUser,
        updateUser,
        deleteUser,

        createGoal,
        updateGoal,
        deleteGoal,

        createGroup
    }
}

module.exports = resolvers