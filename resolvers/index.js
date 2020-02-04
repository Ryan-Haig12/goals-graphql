const { createUser, getUser, loginUser, deleteUser, updateUser } = require('./user')
const { createGoal, updateGoal, deleteGoal, getAllGoals } = require('./goals')
const { createGroup, updateGroup, getGroup, getAllUsersGroups, addUserToGroup, deleteGroup } = require('./group')
const { addFinishedGoal, getFinishedGoals } = require('./finishedGoals')
const { addGroupMessage, getGroupMessages } = require('./groupMessage')

const resolvers = {
    Query: {
        getUser,
        loginUser,

        getAllGoals,

        getFinishedGoals,

        getGroupMessages,
        getGroup,
        getAllUsersGroups
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