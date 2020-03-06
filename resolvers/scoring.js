const moment = require('moment')

const decodeJWT = require('../utils/decodeJWT')
const FinishedGoal = require('../mongooseDataModels/FinishedGoal')

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
    data.sort((a, b) => (a.score < b.score) ? 1 : -1)
    data.map(d => d.rank = count++)

    return data
}

module.exports = {
    calcUserScore,
}