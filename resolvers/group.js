const Group = require('../mongooseDataModels/Group')

const decodeJWT = require('../utils/decodeJWT')

const createGroup = async (parent, args, { userJWT }, info) => {
    const { groupName } = args.data
    let errors = []

    const decoded = decodeJWT(userJWT)
    console.log(decoded)

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

module.exports = {
    createGroup
}