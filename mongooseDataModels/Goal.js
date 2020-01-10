const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GoalSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    notes: {
        type: [ String ],
        default: []
    },
    points: {
        type: Number,
        default: 1
    },
    category: {
        type: String,
        default: 'misc'
    }
})

module.exports = Goal = mongoose.model('goals', GoalSchema)