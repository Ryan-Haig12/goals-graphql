const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { jwtsecret } = require('../../config/keys')

const User = require('../../mongooseDataModels/User')

const createUser = async (parent, args, ctx, info) => {
    const { name, email, password, password2 } = args

    let errors = []
    if(!validator.isEmail(email)) errors.push('Valid Email is required')
    if(!validator.equals(password, password2)) errors.push('Passwords must match')
    if(errors.length) return { errors }

    const salt = await bcrypt.genSalt(10)
    const newPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
        name, email, password: newPassword
    })

    try {
        await newUser.save()
    } catch(err) {
        if(err.code === 11000) errors.push(`Email ${ email } already exists`)
        //errors.push(err.errmsg)
    }
    if(errors.length) return { errors }

    return newUser
}

const getUser = async (parent, args, ctx, info) => {
    const { id, email } = args
    let errors = []

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

const loginUser = async (parent, args, ctx, info) => {
    const { email, password } = args
    let errors = []

    try {
        const user = await User.findOne({ email })
        if(user === null || user === undefined) {
            errors.push(`User with email ${ email } not found`)
            if(errors.length) return { errors }
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) {
            errors.push(`Password ${ password } does not match`)
            if(errors.length) return { errors }
        }
        
        // jwt for saved user
        const payload = {
            user: {
                ...user._doc
            }
        }
        const token = jwt.sign(payload, jwtsecret, { expiresIn: 36000 })
        user._doc.jwt = token
        return {
            ...user._doc,
            jwt: token
        }
    } catch(err) {
        console.log(err)
    }
}

const deleteUser = async (parent, args, ctx, info) => {
    const { id } = args

    const user = await User.findOneAndDelete({ id })
    return {
        user
    }
}

const updateUser = async (parent, args, ctx, info) => {

    const { id, data } = args
    const { name, email } = data

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
    loginUser,
    deleteUser,
    updateUser
}