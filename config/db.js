const mongoose = require('mongoose')

const { mongoURI } = require('./keys')

const connectDB = async () => {
    try {
        await mongoose.connect(mongoURI, { 
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        })
        console.log('Connected to MongoDB')
    } catch(err) {
        console.log(err)
        console.log('here is the error!')
        process.exit(1)
    }
}

module.exports = connectDB