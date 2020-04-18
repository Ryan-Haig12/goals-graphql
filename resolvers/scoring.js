const moment = require('moment')

const decodeJWT = require('../utils/decodeJWT')
const FinishedGoal = require('../mongooseDataModels/FinishedGoal')

// for some reason, just one sort function is not enough to sort the data completely
// adding a second sort function ensures that a user with 12.75 will rank above a user with 12
// need to add another one to ensure 12.75 is ranked higher than 12.5
// so inneficient... I need to figure out how to do this better
const sortData = data => data.sort((a, b) => (parseInt(a.score) < parseInt(b.score)) ? 1 : -1).sort((a, b) => (parseInt(a.score) < parseInt(b.score)) ? 1 : -1).sort((a, b) => (parseInt(a.score) < parseInt(b.score)) ? 1 : -1)

// take in an array of userIds, a single groupId, and 2 epoch times in milliseconds (startTime, endTime)
// loop through every userId, grab all of their finishedGoals where finishedGoals.timeCompleted is in between the startTime and endTime,
// for all of the finishedGoals that are in the given groupId, add the finishedGoals.point / finishedGoals.minutesLogged to the players score
// return an array of objects as: { UserId, totalPointsScored, rank }
const calcUserScore = async (parent, args, { userJWT }, info) => {
    const { userIds, groupId, startTime, endTime } = args.data

    let errors = []
    const decoded = decodeJWT(userJWT)
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return [{ errors }]   
    }

    let groupsFinishedGoals = await FinishedGoal.find({ groupId })
    let data = []

    userIds.map(userId => {
        let score = 0
        const usersFinishedGoals = groupsFinishedGoals.filter(goal => goal.userId === userId)
        usersFinishedGoals.filter(goal => {
            const time = moment(goal.timeCompleted).unix() * 1000

            if(parseInt(startTime) < time && time < parseInt(endTime)) {
                score += goal.points * ((goal.minutesLogged / 15) * .25)
            }

            return parseInt(startTime) < time && time < parseInt(endTime)
        })

        data.push({
            userId, score: score.toFixed(2), rank: -1
        })
    })

    let count = 1
    data = sortData(data)
    data.map(d => d.rank = count++)

    return data
}

// NOT A GRAPHQL ENDPOINT
// this is a helper function to easily calculate userScores
// creating for calcGroupPowerRanking inside of ./stats.js 
const calcUserScore_helperFunction = ({ userIds, allFinishedGoals, startTime, endTime }) => {
    let data = []

    userIds.map(userId => {
        let score = 0
        const usersFinishedGoals = allFinishedGoals.filter(goal => goal.userId === userId)
        usersFinishedGoals.filter(goal => {
            const time = moment(goal.timeCompleted).unix() * 1000

            if(parseInt(startTime) < time && time < parseInt(endTime)) {
                score += goal.points * ((goal.minutesLogged / 15) * .25)
            }

            return parseInt(startTime) < time && time < parseInt(endTime)
        })

        data.push({
            userId, score: score.toFixed(2), rank: -1
        })
    })

    let count = 1
    data = sortData(data)
    data.map(d => d.rank = count++)

    return data
}

module.exports = {
    calcUserScore,
    calcUserScore_helperFunction
}