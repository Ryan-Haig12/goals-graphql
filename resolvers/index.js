const { createUser, getUser, loginUser, deleteUser, updateUser } = require('./auth')
const { createGoal, updateGoal, deleteGoal } = require('./goals')

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
        deleteGoal
    }
}

module.exports = resolvers