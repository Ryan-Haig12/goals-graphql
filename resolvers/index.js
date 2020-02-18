const { createUser, getUser, getMultipleUsersById, loginUser, deleteUser, updateUser } = require('./user')
const { createGoal, updateGoal, deleteGoal, getAllGoals } = require('./goals')
const { createGroup, updateGroup, getGroup, getAllUsersGroups, addUserToGroup, addUserToGroupByEmail, deleteGroup } = require('./group')
const { addFinishedGoal, getFinishedGoals } = require('./finishedGoals')
const { addGroupMessage, getGroupMessages } = require('./groupMessage')
const { createCustomGoal, getCustomGoal, deleteCustomGoal, updateCustomGoal, getAllCustomGoalsByGroupArray } = require('./customGoal')

const resolvers = {
    Query: {
        getUser,
        getMultipleUsersById,
        loginUser,

        getAllGoals,

        getFinishedGoals,
        getCustomGoal,
        getAllCustomGoalsByGroupArray,

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
        addUserToGroupByEmail,
        deleteGroup,

        addFinishedGoal,

        addGroupMessage,

        createCustomGoal,
        deleteCustomGoal,
        updateCustomGoal,
    }
}

module.exports = resolvers