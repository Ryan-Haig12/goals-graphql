const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Create User Schema
const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now()
    },
    totalScoreAllTime: {
        type: Number,
        default: 0
    },
    totalScoreDay: {
        type: Number,
        default: 0
    },
    totalScoreWeek: {
        type: Number,
        default: 0
    },
    totalScoreMonth: {
        type: Number,
        default: 0
    },
    totalScoreGroup: [{
        groupId: {
            type: String,
            default: 'null_group_id',
            required: true
        },
        score: {
            type: Number,
            default: 0,
            required: true
        }
    }],
    groups: {
        type: [ String ],
        default: 0
    },
    completedGoals: {
        type: [ String ],
        default: []
    }
})

module.exports = User = mongoose.model('users', UserSchema)