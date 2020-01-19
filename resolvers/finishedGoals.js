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

module.exports = {
    addFinishedGoal
}