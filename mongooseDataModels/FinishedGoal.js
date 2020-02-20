const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FinishedGoalSchema = new Schema({
    goalId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    groupId: {
        type: String,
        required: true
    },
    timeCompleted: {
        type: Date,
        default: Date.now()
    },
    minutesLogged: {
        type: Number,
        required: true
    },
    points: {
        type: Number,
        required: true
    }
})

module.exports = FinishedGoal = mongoose.model('finishedGoals', FinishedGoalSchema)