const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CustomGoalSchema = new Schema({
    groupId: {
        type: String,
        required: true
    },
    customGoalCreator: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        default: 1
    },
    category: {
        type: String,
        default: 'misc'
    },
    enabled: {
        type: Boolean,
        default: true
    },
})

module.exports = CustomGoal = mongoose.model('customGoals', CustomGoalSchema)