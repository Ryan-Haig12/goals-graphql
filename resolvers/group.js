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
            groupCreator, groupName
        })
        await newGroup.save()

        return { ...newGroup._doc, id: newGroup._doc._id }
    } catch(err) {
        console.log(err)
    }
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
    const { id, data } = args
    const { newUserId } = data
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

        // add newUserId to group.groupMembers if not already a member
        if(currentGroup.groupMembers.includes(newUserId)) {
            errors.push(`User ${ newUserId } is already a member of ${ currentGroup._id }`)
            return { errors }
        }
        currentGroup.groupMembers.push(newUserId)
        await currentGroup.save()

        // add groupId to user.groups
        await User.findByIdAndUpdate({ _id: newUserId }, { $push: { groups: currentGroup._id } })

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
    addUserToGroup,
    deleteGroup
}