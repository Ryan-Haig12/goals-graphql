const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GroupMessageSchema = new Schema({
    message: {
        type: String,
        required: true
    },
    authorId: {
        type: String,
        required: true
    },
    groupId: {
        type: String,
        required: true
    },
    timeWritten: {
        type: Date,
        default: Date.now()
    },
    expirationTime: {
        type: Date,
        default: Date.now() + (60 * 60 * 24 * 1000)
    },
})

module.exports = GroupMessage = mongoose.model('groupMessage', GroupMessageSchema)