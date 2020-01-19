const moment = require('moment')
const _ = require('lodash')

const GroupMessage = require('../mongooseDataModels/GroupMessage')

const decodeJWT = require('../utils/decodeJWT')

const addGroupMessage = async (parent, args, { userJWT }, info) => {
    let errors = []

    const decoded = decodeJWT(userJWT)
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return { errors }   
    }

    try {
        const newGroupMessage = new GroupMessage({
            ...args.data
        }) 
        await newGroupMessage.save()

        return { ...newGroupMessage._doc, id: newGroupMessage._doc._id }
    } catch(err) {
        console.log(err)
    }
}

const getGroupMessages = async (parent, args, { userJWT }, info) => {
    const { groupId } = args

    let groupsMessages = await GroupMessage.find({ groupId })

    // if groupMessage is over 24 hours old, delete it
    groupsMessages.map(async ({ id, expirationTime }) => {
        const isExpired = moment(expirationTime).unix() * 1000 < Date.now()
        if(isExpired) {
            await GroupMessage.findByIdAndDelete({ _id: id })
        }
    })

    return groupsMessages
}

module.exports = {
    addGroupMessage,
    getGroupMessages,
}