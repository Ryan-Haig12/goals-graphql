const mongoose = require('mongoose')
const Schema = mongoose.Schema

const GroupSchema = new Schema({
   groupCreator: {
       type: String,
       required: true
   },
   groupName: {
       type: String,
       required: true
   },
   groupMembers: {
       type: [ String ],
       default: []
   }
})

module.exports = Group = mongoose.model('groups', GroupSchema)