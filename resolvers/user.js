const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { jwtsecret } = require('../config/keys')

const User = require('../mongooseDataModels/User')

const decodeJWT = require('../utils/decodeJWT')

//const isGroupAdmin = require('../utils/isGroupAdmin')

const createUser = async (parent, args, ctx, info) => {
    const { name, email, password, password2 } = args.data

    let errors = []
    if(!name) errors.push('Name is required')
    if(name && name.length < 6) errors.push('Name must be at least 6 characters')
    if(!validator.isEmail(email)) errors.push('Valid Email is required')
    if(!validator.equals(password, password2)) errors.push('Passwords must match')
    if(!password || !password2) errors.push('Both passwords are required')
    if(password && password.length < 6) errors.push('Password must be at least 6 characters')
    if(errors.length) return { errors }

    const salt = await bcrypt.genSalt(10)
    const newPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
        name, email, password: newPassword
    })

    try {
        await newUser.save()

        // jwt for saved user
        const payload = {
            user: {
                ...newUser._doc,
                password: null
            }
        }
        const token = jwt.sign(payload, jwtsecret, { expiresIn: 36000 })
        newUser.jwt = token
    } catch(err) {
        if(err.code === 11000) errors.push(`Email ${ email } already exists`)
        //errors.push(err.errmsg)
    }
    if(errors.length) return { errors }

    return newUser
}

const getUser = async (parent, args, { userJWT }, info) => {
    const { id, email } = args
    let errors = []

    // auth patron
    const decoded = decodeJWT(userJWT)
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return { errors }   
    }

    if(email !== undefined) {
        if(!validator.isEmail(email)) errors.push('Valid Email is required')
        if(errors.length) return { errors }   
    } 

    if(id) {
        try {
            const user = await User.findById({ _id: id })
            return user
        } catch(err) {
            errors.push(`User with id ${ id } not found`)
            if(errors.length) return { errors }
        }
    }
    
    if(email) {
        try {
            const user = await User.findOne({ email })
            if(user !== null) return user

            errors.push(`User with email ${ email } not found`)
            if(errors.length) return { errors }
            return 
        } catch(err) {
            errors.push(`Error fetching user`)
            if(errors.length) return { errors }
        }
    }

    errors.push('No id or email given')
    return {
        errors
    }
}

// return all users in an array of userIds
const getMultipleUsersById = async (parent, args, { userJWT }, info) => {
    let errors = []
    const decoded = decodeJWT(userJWT)
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return { errors }   
    }
    // get all users from db, sort through those
    // this makes it only 1 call to db
    try {
        const allUsers = await User.find({})
        const users = allUsers.filter(user => args.userIds.includes(user._id.toString()))
        console.log(users)
        return users
    } catch(err) {
        console.log(err)
    }
}

const loginUser = async (parent, args, ctx, info) => {
    const { email, password } = args
    let errors = []

    if(!email) errors.push('Email is required')
    if(!password) errors.push('Password is required')
    if(errors.length) return { errors }

    try {
        const user = await User.findOne({ email })
        if(user === null || user === undefined) {
            errors.push(`User with email ${ email } not found`)
            if(errors.length) return { errors }
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) {
            errors.push(`Password is incorrect`)
            if(errors.length) return { errors }
        }
        
        // jwt for saved user
        const payload = {
            user: {
                ...user._doc,
                password: null
            }
        }
        const token = jwt.sign(payload, jwtsecret, { expiresIn: 36000 })
        user._doc.jwt = token
        return {
            ...user._doc,
            jwt: token,
            password: null,
            id: user._doc._id
        }
    } catch(err) {
        console.log(err)
    }
}

const deleteUser = async (parent, args, { userJWT }, info) => {
    const { id } = args

    // auth patron
    const decoded = decodeJWT(userJWT)
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return { errors }   
    }
    
    const user = await User.findOneAndDelete({ id })
    return {
        user, password: null
    }
}

const updateUser = async (parent, args, { userJWT }, info) => {

    const { id, data } = args
    const { name, email } = data

    // auth patron
    const decoded = decodeJWT(userJWT)
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return { errors }   
    }

    const user = await User.findById({ _id: id })

    if(!user) {
        return {
            errors: [ `User ${ id } not found!` ]
        }
    }
    
    if(name) user._doc.name = name
    if(email) user._doc.email = email

    try {
        await user.save()

        return {
            ...user._doc, id
        }
    } catch (err) {
        console.log(err)
    }
}

module.exports = {
    createUser,
    getUser,
    getMultipleUsersById,
    loginUser,
    deleteUser,
    updateUser
}