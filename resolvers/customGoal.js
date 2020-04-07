const _ = require('lodash')

const CustomGoal = require('../mongooseDataModels/CustomGoal')
const Group = require('../mongooseDataModels/Group')

const decodeJWT = require('../utils/decodeJWT')

// Create a brand new custom goal
// a custom goal is similar to a default goal, but is attached to a specific group.
// Custom goals can also override values from default goals and be used to 
// disable, change points, or change 
const createCustomGoal = async (parent, args, { userJWT }, info) => {
    // auth patron
    const decoded = decodeJWT(userJWT)
    let errors = []
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return { errors }
    }
    const { title, category, groupId, customGoalCreator } = args.data

    // groupId doesn't exist
    const group = await Group.findOne({ _id: groupId })
    if(!group) {
        errors.push(`Group ${ groupId } does not exist`)
        return { errors }
    }
    // category/title match already exists
    const allGoalsWithSameTitle = await CustomGoal.find({ groupId })
    for(let goal in allGoalsWithSameTitle) {
        if(allGoalsWithSameTitle[goal].category === category && allGoalsWithSameTitle[goal].title === title) {
            errors.push('Title/Category pair already exists for your group')
            return { errors }
        }
    }
    // customGoalCreator is not in groupMembers
    if(!group.groupMembers.includes(customGoalCreator)) {
        errors.push(`User ${ customGoalCreator } does not belong to group ${ groupId }`)
        return { errors }
    }
    // if userId from args.data does not match userId from JWT
    if(decoded._id !== customGoalCreator) {
        errors.push(`UserId ${ customGoalCreator } does not match JWT _id ${ decoded._id }`)
        return { errors }
    }

    // save the newCustomGoal to the db and return the data including the customGoal.id
    try {
        const newCustomGoal = new CustomGoal({ ...args.data })
        const goal = await newCustomGoal.save()
        return goal
    } catch(err) {
        console.log(err)
    }
}

// get CustomGoals by groupId, goalCreatorId, or both
const getCustomGoal = async (parent, args, { userJWT }, info) => {
    const decoded = decodeJWT(userJWT)
    let errors = []
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return { errors }
    }

    const { groupId, creatorId } = args
    // if neither groupId or creatorId are present, throw an error. Need at least one of these
    if(!groupId && !creatorId) {
        errors.push('Need to pass in either a groupId or a creatorId')
        return { errors }
    }

    try {
        // collect goals by group and creator id
        // if the other value does not exist, just return the single array
        let groupIdGoals, creatorIdGoals
        if(groupId) {
            groupIdGoals = await CustomGoal.find({ groupId })
            if(!creatorId) return groupIdGoals
        }
        if(creatorId) {
            creatorIdGoals = await CustomGoal.find({ customGoalCreator: creatorId })
            if(!groupId) return creatorIdGoals
        }

        // if there is a groupId and a creatorId present in the query
        // merge the goals arrays, remove duplicates, return results
        const combinedGoals = _.concat(groupIdGoals, creatorIdGoals)
        const remainingGoals = _.uniqBy(combinedGoals, 'id')
        return remainingGoals
    } catch(err) {
        console.log(err)
    }
}

// return all customGoals in an array of groupIds
const getAllCustomGoalsByGroupArray = async (parent, args, { userJWT }, info) => {
    const decoded = decodeJWT(userJWT)
    let errors = []
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return [{ errors }]
    }

    const { groupIds } = args
    if(!groupIds.length) {
        errors.push('No groupIds given')
        return [{ errors }]
    }

    try {
        const allCustomGoals = groupIds.map(async groupId => {
            return await CustomGoal.find({ groupId })
        })
        const data = await Promise.all(allCustomGoals)
        
        // this for sure isnt the prettiest code ever
        // but it works
        // 2ish hours of debugging for this mapper function right here
        // i'm leaving it idc
        let x = 0
        let ret = data.map(group => {
            return {
                groupId: groupIds[x++],
                customGoals: group
            }
        })

        ret.map(d => {
            if(d.customGoals.length) {
                d.customGoals.sort((a, b) => (a.title > b.title) ? 1 : -1)
            }
        })

        return ret
    } catch(err) {
        console.log(err)
    }   
}

const deleteCustomGoal = async (parent, args, { userJWT }, info) => {
    const decoded = decodeJWT(userJWT)
    let errors = []
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return { errors }
    }

    if(!args.customGoalId) {
        errors.push(`Need to pass in customGoalId`)
        return { errors }
    }

    try {
        // if the JWT being passed in is not the creator of the customGoal, do not delete the goal
        const customGoal = await CustomGoal.find({ _id: args.customGoalId })
        if(!customGoal[0] || customGoal[0] === undefined) {
            errors.push(`CustomGoal ${ args.customGoalId } does not exist`)
            return { errors }
        }
        if(customGoal[0].customGoalCreator != decoded._id) {
            errors.push(`You are not permitted to delete this CustomGoal`)
            return { errors }
        }

        const deletedGoal = await CustomGoal.findOneAndDelete({ _id: args.customGoalId })
        return deletedGoal
    } catch(err) {
        console.log(err)
    }

    return {}
}

const updateCustomGoal = async (parent, args, { userJWT }, info) => {
    let errors = []
    const decoded = decodeJWT(userJWT)
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return { errors }   
    }

    try {
        let customGoal = await CustomGoal.findByIdAndUpdate({ _id: args.data.customGoalId }, { ...args.data })

        // update local object to return the new data
        delete args.data.customGoalId // <- makes the for each below SLIGHTLY faster, but I had no idea delete was a keyword
        Object.keys(args.data).forEach(key => {
            if(customGoal._doc[key] != args.data[key]) customGoal._doc[key] = args.data[key]
        })
    
        return customGoal
    } catch(err) {
        console.log(err)
    }
}

module.exports = {
    createCustomGoal,
    getCustomGoal,
    deleteCustomGoal,
    updateCustomGoal,
    getAllCustomGoalsByGroupArray
}