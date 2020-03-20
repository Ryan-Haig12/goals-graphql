const moment = require('moment')
const _ = require('lodash')

const GroupMessage = require('../mongooseDataModels/GroupMessage')

const decodeJWT = require('../utils/decodeJWT')

const addGroupMessage = async (parent, args, { userJWT, pubsub }, info) => {
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

        pubsub.publish(`groupMessageSent ${newGroupMessage.groupId}`, { groupMessageSent: newGroupMessage })

        return { ...newGroupMessage._doc, id: newGroupMessage._doc._id }
    } catch(err) {
        console.log(err)
    }
}

// subscription that returns a newGroupMessage when the 
const groupMessageSent = {
    subscribe: async (parent, { groupId }, { userJWT, pubsub }, info) => {
        const group = await Group.findById({ _id: groupId })

        if(!group) {
            throw new Error(`GroupId ${ groupId } not found`)
        }
        
        return pubsub.asyncIterator(`groupMessageSent ${groupId}`)
    }
}

const getGroupMessages = async (parent, args, { userJWT, pubsub }, info) => {
    const { groupId } = args

    // auth patron
    const decoded = decodeJWT(userJWT)
    let errors = []
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return [{ errors }]   
    }

    let groupsMessages = await GroupMessage.find({ groupId })
    // if groupMessage is over 24 hours old, delete it
    let retMessages = []
    groupsMessages.filter(async ( message ) => {
        const isExpired = moment(message.expirationTime).unix() * 1000 < Date.now()
        if(isExpired) {
            await GroupMessage.findByIdAndDelete({ _id: message.id })
            return false
        }
        retMessages.push(message)
        return true
    })

    // if groupMessages returned exceeds 10, delete the oldest (11th)
    // groupMessage, only return 10 groupMessages at once
    if(retMessages.length > 10) {
        const messagesToDelete = retMessages.splice(0, retMessages.length - 10)
        messagesToDelete.map(async message => await GroupMessage.findByIdAndDelete({ _id: message.id }))
        retMessages = retMessages.splice(retMessages.length - 10, retMessages.length)
    }

    return retMessages
}

module.exports = {
    addGroupMessage,
    getGroupMessages,
    groupMessageSent
}