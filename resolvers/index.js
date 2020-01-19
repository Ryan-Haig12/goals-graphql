const { createUser, getUser, loginUser, deleteUser, updateUser } = require('./user')
const { createGoal, updateGoal, deleteGoal } = require('./goals')
const { createGroup, updateGroup, addUserToGroup, deleteGroup } = require('./group')
const { addFinishedGoal } = require('./finishedGoals')
const { addGroupMessage } = require('./groupMessage')

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

        addFinishedGoal,

        addGroupMessage,
    }
}

module.exports = resolvers