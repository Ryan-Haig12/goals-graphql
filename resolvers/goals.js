const Goal = require('../mongooseDataModels/Goal')

const createGoal = async (parent, args, { jwt }, info) => {
    const { title, points, category } = args.data
    let errors = []

    if(!jwt) {
        errors.push('You must be authed to use this endpoint')
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

const updateGoal = async (parent, args, ctx, info) => {
    const { id, data } = args
    const { title, points, category } = data

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

const deleteGoal = async (parent, args, ctx, info) => {
    const { id } = args

    try {
        const goal = await Goal.findOneAndDelete({ _id: id })
        return { goal }
    } catch(err) {
        console.log(err)
    }
}

module.exports = {
    createGoal,
    updateGoal,
    deleteGoal
}