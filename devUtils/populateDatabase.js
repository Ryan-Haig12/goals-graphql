const bcrypt = require('bcryptjs')

const Goal = require('../mongooseDataModels/Goal')
const Group = require('../mongooseDataModels/Group')
const User = require('../mongooseDataModels/User')

require('../config/db')()

// Clear out the db
Goal.deleteMany({}, () => {})
Group.deleteMany({}, () => {})
User.deleteMany({}, () => {})

const goals = [
    { title: 'Workout', category: 'Physical' },
    { title: 'Climb', category: 'Physical' },
    { title: 'Yoga', category: 'Physical' },
    { title: 'Hike', category: 'Physical' },
    { title: 'Walk', category: 'Physical' },
    { title: 'Bike', category: 'Physical' },
    { title: 'Run', category: 'Physical' },
    { title: 'Sleep', category: 'Physical' },
    { title: 'Cold Shower', category: 'Physical' },
    { title: 'Oil Pulling', category: 'Physical' },
    { title: 'Breathwork', category: 'Physical' },
    { title: 'Dry Brushing', category: 'Physical' },
    { title: 'Wild Card', category: 'Physical' },

    { title: 'Healthy Breakfast / Portion', category: 'Nutrition' },
    { title: 'Healthy Lunch / Portion', category: 'Nutrition' },
    { title: 'Healthy Dinner / Portion', category: 'Nutrition' },
    { title: 'Water Intake', category: 'Nutrition' },
    { title: 'Intermittent Fasting', category: 'Nutrition' },
    { title: '24-Hour Fast (BAD!!!)', category: 'Nutrition' },
    { title: 'Wild Card', category: 'Nutrition' },

    { title: 'Writing', category: 'Mental' },
    { title: 'Reading', category: 'Mental' },
    { title: 'Expression', category: 'Mental' },
    { title: 'De-Clutter', category: 'Mental' },
    { title: 'Skill', category: 'Mental' },
    { title: 'Wild Card', category: 'Mental' },

    { title: 'Meditiation', category: 'Spiritual' },
    { title: 'Prayer', category: 'Spiritual' },
    { title: 'Scripture', category: 'Spiritual' },
    { title: 'Spiritual Community', category: 'Spiritual' },
    { title: 'Wild Card', category: 'Spiritual' },

    { title: 'Letter Writing', category: 'Emotional' },
    { title: 'Phone Call', category: 'Emotional' },
    { title: 'Email', category: 'Emotional' },
    { title: 'Affirmations', category: 'Emotional' },
    { title: 'Intentional Quality Time, Friend', category: 'Emotional' },
    { title: 'Wild Card', category: 'Emotional' },
]

const users = [
    { name: "Test 1", email: "testhaig1@haig.com" },
    { name: "Test 2", email: "testhaig2@haig.com" },
    { name: "Test 3", email: "testhaig3@haig.com" },
    { name: "Test 4", email: "testhaig4@haig.com" },
    { name: "Test 5", email: "testhaig5@haig.com" },
]

goals.forEach(async el => {
    console.log(el)
    const newGoal = new Goal({
        title: el.title,
        category: el.category
    })
    try {
        await newGoal.save()
    } catch(err) {
        console.log(err)
    }
})

const genPassword = async () => {
    const salt = await bcrypt.genSalt(10)
    const password = await bcrypt.hash('password', salt)
    return password
}

users.forEach(async el => {
    console.log(el)
    
    const newUser = new User({
        name: el.name,
        email: el.email,
        password: await genPassword()
    })

    // Create group for testhaig1 and testhaig2
    if(el.email === 'testhaig1@haig.com') {
        const newGroup = new Group({
            groupCreator: newUser._doc._id,
            groupName: 'testhaig1 Group'
        })
        await newGroup.save()
    }
    else if(el.email === 'testhaig2@haig.com') {
        const newGroup = new Group({
            groupCreator: newUser._doc._id,
            groupName: 'testhaig2 Group'
        })
        await newGroup.save()
    }

    try {
        await newUser.save()
    } catch(err) {
        console.log(err)
    }
})

console.log(
    `You\'re ganna want/have to kill the server (Ctrl + C) in just a few moments...
Whenever the Goals table hits ${ goals.length } and
the Users table hits ${ users.length }`
)