const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GroupSchema = new Schema({
   groupCreator: {
       type: String,
       required: true
   },
   friends: [{
       friendId: {
           type: String,
           required: true
       },
       totalScore: {
           type: Number,
           default: 0
       },
       completedGoals: {
           type: [ String ],
           default: []
       }
   }]
})

module.exports = Group = mongoose.model('groups', GroupSchema)