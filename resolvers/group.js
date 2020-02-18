const Group = require('../mongooseDataModels/Group')
const User = require('../mongooseDataModels/User')

const decodeJWT = require('../utils/decodeJWT')

const createGroup = async (parent, args, { userJWT }, info) => {
    const { groupName } = args.data
    let errors = []

    const decoded = decodeJWT(userJWT)

    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return { errors }   
    }

    try {
        const groupCreator = decoded._id
        const newGroup = new Group({
            groupCreator, groupName, groupMembers: [ groupCreator ]
        })
        await newGroup.save()

        return { ...newGroup._doc, id: newGroup._doc._id }
    } catch(err) {
        console.log(err)
    }
}

const getGroup = async (parent, args, { userJWT }, info) => {
    const decoded = decodeJWT(userJWT)
    let errors = []
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return { errors }   
    }
    const { groupId } = args
    
    try {
        const group = await Group.findById({ _id: groupId })
        if(!group) {
            errors.push(`Group ${ groupId } was not found`)
            return { errors }
        }
        return group
    } catch(err) {
        errors.push(`${ groupId } is not a valid MongoDB id`)
        return { errors }
    }
}

// Get all groups that the decoded.jwt id matches
const getAllUsersGroups = async(parent, args, { userJWT }, info) => {
    const decoded = decodeJWT(userJWT)
    let errors = []
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return [{ errors }]   
    }

    // match the JWT userId and userId passed in via query
    const { userId } = args
    const { _id } = decoded
    if(_id !== userId) {
        errors.push('UserId does not match JWT._id')
        return [{ errors }]
    }

    // only return groups that the user is a member of
    const allUsersGroups = await Group.find({ groupMembers: userId })
    return allUsersGroups
}

const updateGroup = async (parent, args, { userJWT }, info) => {
    const { id, data } = args
    const { groupName } = data
    let errors = []

    const decoded = decodeJWT(userJWT)

    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return { errors }   
    }
    
    try {
        const currentGroup = await Group.findById({ _id: id })

        // if user is the creator, update group
        if(decoded._id === currentGroup.groupCreator){
            await Group.findByIdAndUpdate({ _id: id }, {
                groupName
            })
            
            return { ...currentGroup._doc, groupName, id: currentGroup._doc._id }
        }
    } catch(err) {
        console.log(err)
    }
}

const addUserToGroup = async (parent, args, { userJWT }, info) => {
    const { groupId, newUserId } = args.data
    let errors = []

    if(!newUserId){
        errors.push('Need to pass in newUserId')
        return { errors }
    }

    // auth patron
    const decoded = decodeJWT(userJWT)
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return { errors }   
    }

    try {
        const currentGroup = await Group.findById({ _id: groupId })

        if(!currentGroup || currentGroup === undefined || currentGroup === null) {
            errors.push(`Group ${ groupId } not found`)
            return { errors }
        }

        // make sure JWT is groupCreator
        if(!(decoded._id === currentGroup.groupCreator)) {
            errors.push('User is not an admin for this group')
            return { errors }
        }

        // add newUserId to group.groupMembers if not already a member
        if(currentGroup.groupMembers.includes(newUserId)) {
            errors.push(`User ${ newUserId } is already a member of ${ currentGroup._id }`)
            return { errors }
        }
        currentGroup.groupMembers.push(newUserId)
        await currentGroup.save()

        // return group with newUser in group.groupMembers
        return { ...currentGroup._doc }

    } catch(err) {
        console.log(err)
    }
}

// This shit in AddUserToGroup.js is pissing me off, let's just create a new endpoint
const addUserToGroupByEmail = async(parent, args, { userJWT }, info) => {
    const { groupId, newUserEmail } = args.data
    let errors = []

    if(!newUserEmail || !groupId){
        errors.push('Need to pass in newUserEmail and groupId')
        return { errors }
    }

    //auth patron
    const decoded = decodeJWT(userJWT)
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return { errors }
    }

    try {
        // make sure group exists and the userJWT matches the groupCreator
        const currentGroup = await Group.findById({ _id: groupId })
        if(!currentGroup || currentGroup === undefined || currentGroup === null) {
            errors.push(`Group ${ groupId } not found`)
            return { errors }
        }
        if(!(decoded._id === currentGroup.groupCreator)) {
            errors.push('User is not an admin for this group')
            return { errors }
        }

        // grab user, ensure it exists
        const user = await User.findOne({ email: newUserEmail })
        console.log(user)
        if(!user) {
            errors.push(`User with email ${ newUserEmail } not found`)
            return { errors }
        }

        // add newUserId to group.groupMembers if not already a member
        if(currentGroup.groupMembers.includes(user.id)) {
            errors.push(`User ${ newUserEmail } is already a member of group ${ currentGroup._id }`)
            return { errors }
        }
        currentGroup.groupMembers.push(user.id)
        await currentGroup.save()

        // return group with newUser in group.groupMembers
        return { ...currentGroup._doc }
    } catch(err) {
        console.log(err)
    }
}

const deleteGroup = async (parent, args, { userJWT }, info) => {
    const { id } = args
    let errors = []

     // auth patron
     const decoded = decodeJWT(userJWT)
     if(decoded.status === 'error') {
         errors.push(decoded.msg)
         return { errors }   
     }

    try {
        const currentGroup = await Group.findById({ _id: id })

        if(!currentGroup || currentGroup === undefined || currentGroup === null) {
            errors.push(`Group ${ id } not found`)
            return { errors }
        }

        // make sure JWT is groupCreator
        if(!(decoded._id === currentGroup.groupCreator)) {
            errors.push('User is not an admin for this group')
            return { errors }
        }

        const group = await Group.findByIdAndDelete({ _id: id })
        return { ...group._doc, id: group._doc._id }
    } catch(err) {
        console.log(err)
    }
}

module.exports = {
    createGroup,
    updateGroup,
    getGroup,
    getAllUsersGroups,
    addUserToGroup,
    addUserToGroupByEmail,
    deleteGroup
}