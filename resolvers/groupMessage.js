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

module.exports = {
    addGroupMessage
}