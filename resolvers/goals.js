const _ = require('lodash')

const Goal = require('../mongooseDataModels/Goal')
//const Group = require('../mongooseDataModels/Group')

const decodeJWT = require('../utils/decodeJWT')

const createGoal = async (parent, args, { userJWT }, info) => {
    const { title, points, category } = args.data
    let errors = []

    // auth patron
    const decoded = decodeJWT(userJWT)
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return { errors }   
    }

    const newGoal = new Goal({
        title, points, category
    })

    try {
        // If goal exists, delete it
        const data = await Goal.findOne({ title })
        if(data) {
            errors.push(`Goal ${ title } already exists`)
            return { errors }
        }

        await newGoal.save()
    } catch(err) {
        console.log('server done broke')
    }

    return { ...newGoal._doc, id: newGoal._doc._id }
}

const updateGoal = async (parent, args, { userJWT }, info) => {
    const { id, data } = args
    const { title, points, category } = data

    // auth patron
    let errors = []
    const decoded = decodeJWT(userJWT)
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return { errors }   
    }

    const goal = await Goal.findByIdAndUpdate({ _id: id }, {
        title, points, category
    })

    try {
        await goal.save()

        return { ...goal._doc, id, title, points, category }
    } catch(err) {
        console.log(err)
    }
}

const deleteGoal = async (parent, args, { userJWT }, info) => {
    const { id } = args

    // auth patron
    let errors = []
    const decoded = decodeJWT(userJWT)
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return { errors }   
    }

    try {
        const goal = await Goal.findOneAndDelete({ _id: id })
        return { goal }
    } catch(err) {
        console.log(err)
    }
}

// i guess I should have called this "getAllDefaultGoals" but oh well
const getAllGoals = async (parent, args, { userJWT }, info) => {
    let errors = []
    const decoded = decodeJWT(userJWT)
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return [{
            category: null,
            goals: [{ errors }]
        }]
    }

    const allGoals = await Goal.find({})
    // sort goals into alphabetical order by category
    allGoals.sort((a, b) => (a.category > b.category) ? 1 : -1)

    // Get all categories
    const categories = _.uniq(allGoals.map(goal => goal.category))

    // set up data to be returned
    const data = categories.map(category => {
        return {
            category,
            goals: []
        }
    })
    
    // sort categories into proper data structure
    allGoals.map(goal => {
        data.map(d => {
            if(d.category === goal.category) d.goals.push(goal)
        })
    })

    // sort all title names in each category
    data.map(d => {
        d.goals.sort((a, b) => (a.title > b.title) ? 1 : -1)
    })

    return data
}

// SCRAPPING FOR NOW
// the intention of this endpoint was to have an easy way to return enabled/disabled goals
// as of now, I don't believe that defaultGoals should be disabled like I thought most of the project up to 5 mins ago
// due to the fact that customGoals are much easier to enable/disable, I'm going to stick with JUST those for now
// refactor to getAlLGoalsV2
// takes in a groupId and returns an object with 3 arrays
// the first is defaultGoals for all of the enabled defaultGoals
// the second is customGoals for all of the enabled/disabled customGoals
// const getAllGoalsV2 = async (parent, { groupId }, { userJWT }, info) => {
//     let errors = []
//     const decoded = decodeJWT(userJWT)
//     if(decoded.status === 'error') {
//         errors.push(decoded.msg)
//         return { errors }
//     }

//     // ensure that the group exists 
//     if(!groupId.length > 0) return { errors: [ 'No GroupId provided you sent an empty groupId you absolute waste of space'] }
//     const group = await Group.findById({ _id: groupId })
//     if(!group) return { errors: [ `Group ${ groupId } not found` ] }

//     // grab all of the default and custom goals

//     // filter out default goals that are enabled=false in the 
// }

module.exports = {
    createGoal,
    updateGoal,
    deleteGoal,
    getAllGoals,
    //getAllGoalsV2
}