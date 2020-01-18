const { createUser, getUser, loginUser, deleteUser, updateUser } = require('./user')
const { createGoal, updateGoal, deleteGoal } = require('./goals')
const { createGroup, updateGroup, addUserToGroup, deleteGroup } = require('./group')

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

        createGroup,
        updateGroup,
        addUserToGroup,
        deleteGroup,
    }
}

module.exports = resolvers