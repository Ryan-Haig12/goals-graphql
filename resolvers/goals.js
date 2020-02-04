const Goal = require('../mongooseDataModels/Goal')

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

const getAllGoals = async (parent, args, ctx, info) => {
    const allGoals = await Goal.find({})
    return allGoals
}

module.exports = {
    createGoal,
    updateGoal,
    deleteGoal,
    getAllGoals
}