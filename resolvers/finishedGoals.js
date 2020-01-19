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

const getFinishedGoals = async (parent, args, { userJWT }, info) => {
    const { userId, groupId } = args.data
    let errors = []

    const decoded = decodeJWT(userJWT)
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return { errors }   
    }

    try {
        let userGoals = []
        let groupGoals = []
        if(userId) userGoals = await FinishedGoal.find({ userId })
        if(groupId) groupGoals = await FinishedGoal.find({ groupId })
        
        const allGoals = _.concat(userGoals, groupGoals)
        const remainingGoals = _.uniqBy(allGoals, 'id')

        return remainingGoals
    } catch(err) {
        console.log(err)
    }
}

module.exports = {
    addFinishedGoal,
    getFinishedGoals
}