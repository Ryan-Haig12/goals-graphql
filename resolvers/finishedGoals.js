const _ = require('lodash')

const FinishedGoal = require('../mongooseDataModels/FinishedGoal')

const decodeJWT = require('../utils/decodeJWT')

const addFinishedGoal = async (parent, args, { userJWT }, info) => {
    let errors = []

    const decoded = decodeJWT(userJWT)
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return { errors }   
    }

    try {
        const newFinishedGoal = new FinishedGoal({
            ...args.data
        }) 
        await newFinishedGoal.save()

        return { ...newFinishedGoal._doc, id: newFinishedGoal._doc._id }
    } catch(err) {
        console.log(err)
    }
}

// for all intents and purposes, this endpoint should only be called with 1 of the arguments available
// when doing 2+ args, the array is not being filtered out properly
// for right now, this shouldn't be a problem as long as this is called with just 1 arg
const getFinishedGoals = async (parent, args, { userJWT }, info) => {
    const { userId, groupId, goalId } = args.data
    let errors = []

    const decoded = decodeJWT(userJWT)
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return [{ errors }]   
    }

    try {
        let userGoals = []
        let groupGoals = []
        let goalGoals = [] // nice naming convention ryan
        if(userId) userGoals = await FinishedGoal.find({ userId })
        if(groupId) groupGoals = await FinishedGoal.find({ groupId })
        if(goalId) goalGoals = await FinishedGoal.find({ goalId })
        
        const allGoals = _.concat(userGoals, groupGoals, goalGoals)
        // if calling with 2 args is ever needed, change this
        const remainingGoals = _.uniqBy(allGoals, '_id')

        return remainingGoals
    } catch(err) {
        console.log(err)
    }
}

module.exports = {
    addFinishedGoal,
    getFinishedGoals
}