const { createUser, getUser, getUserByJWT, getMultipleUsersById, loginUser, deleteUser, updateUser } = require('./user')
const { createGoal, updateGoal, deleteGoal, getAllGoals } = require('./goals')
const { createGroup, updateGroup, getGroup, getAllUsersGroups, addUserToGroup, addUserToGroupByEmail, deleteGroup } = require('./group')
const { addFinishedGoal, getFinishedGoals } = require('./finishedGoals')
const { addGroupMessage, getGroupMessages, groupMessageSent } = require('./groupMessage')
const { createCustomGoal, getCustomGoal, deleteCustomGoal, updateCustomGoal, getAllCustomGoalsByGroupArray } = require('./customGoal')
const { calcUserScore } = require('./scoring')

//const Group = require('../mongooseDataModels/Group')

const resolvers = {
    Query: {
        getUser,
        getUserByJWT,
        getMultipleUsersById,
        loginUser,

        getAllGoals,

        getFinishedGoals,
        getCustomGoal,
        getAllCustomGoalsByGroupArray,

        getGroupMessages,
        getGroup,
        getAllUsersGroups,

        calcUserScore,

        // simple test to make sure graphql is loaded
        // also using for frontend test to look into re-usable hooks
        ping: () => 'pong'
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
    },

    Subscription: {
        groupMessageSent
    }
}

module.exports = resolvers