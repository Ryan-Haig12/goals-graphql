// created a test group called Random Seed Group
// there are 5 test users in that group
// this file is to randomly generate 3-7 goals for those users in a given day
// this is meant to create dummy data in some way\

const moment = require('moment')

// groupId: 5e8158d1ad22545b5a28005a
// userIds: 
// ['5e38fd41442ef1d73086ff13', testhaig1@haig.com
//  '5e815996ad22545b5a28005b', tonyp@testuser.com
//  '5e8159b5ad22545b5a28005c', Lagana@testuser.com
//  '5e8159d3ad22545b5a28005d', scuba@testuser.com
//  '5e8159fcad22545b5a28005e'] jennyfromthebliocj@testuser.com
const userIds = ['5e38fd41442ef1d73086ff13', '5e815996ad22545b5a28005b', '5e8159b5ad22545b5a28005c', '5e8159d3ad22545b5a28005d', '5e8159fcad22545b5a28005e']

const FinishedGoals = require('../mongooseDataModels/FinishedGoal')
const Goal = require('../mongooseDataModels/Goal')

require('../config/db')()

const getRandomGoal = (allGoals) => {
    return allGoals[ Math.floor(Math.random() * allGoals.length) ]
}

const seedData = async () => {
    const allGoals = await Goal.find()
    const times = [ 15, 30, 45, 60 ]

    // map through all users, log 3 - 7 random goals
    userIds.map(async id => {
        const numOfGoals = Math.floor(Math.random() * 5) + 3
        for(let i = 0; i < numOfGoals; i++) {
            const randomGoal = getRandomGoal(allGoals)

            const newFinishedGoal = new FinishedGoals({
                goalId: randomGoal._id,
                userId: id,
                groupId: "5e8158d1ad22545b5a28005a",
                timeCompleted: Date.now(),
                //timeCompleted: moment().subtract(1, 'week').unix() * 1000,
                minutesLogged: times[Math.floor(Math.random() * times.length)],
                points: randomGoal.points
            })
            await newFinishedGoal.save()
        }
    })

    console.log(`You\'re ganna want/have to kill the server (Ctrl + C) in just a few moments...`)
}

seedData()