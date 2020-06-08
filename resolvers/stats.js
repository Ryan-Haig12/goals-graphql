const moment = require('moment')

const { calcUserScore_helperFunction } = require('./scoring')
const decodeJWT = require('../utils/decodeJWT')
//const CustomGoal = require('../mongooseDataModels/CustomGoal')
const FinishedGoal = require('../mongooseDataModels/FinishedGoal')
const Goal = require('../mongooseDataModels/Goal')
const Group = require('../mongooseDataModels/Group')
const User = require('../mongooseDataModels/User')

// this endpoint is to calculate a score report for a single user used for their user profile
// all the endpoint takes in is the userId
// returned is an array of the last 5 goals a user completed, their total # of goals completed, 
// total # of custom goals completed, total time logged
// their favorite goal, their favorite customGoal, 
// and a time report for their total score and time logged for various times
const calcUserStat = async ( parent, { userId }, { userJWT }, info ) => {
    let errors = []

    // auth patron
    const decoded = decodeJWT(userJWT)
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return { errors }   
    }

    // if userId not found, throw error
    const user = await User.findById({ _id: userId })
    if(!user) {
        errors.push('User Not Found')
        return { errors }
    }
    
    // allGoals that the user has finished
    const allFinishedGoals = await FinishedGoal.find({ userId })

    // grab the last 5 finishedGoals the user completed
    // grab them by their actual goal data
    // returned where the 0 el is the most recent and 4 is the 
    const _lastFiveFinishedGoals = allFinishedGoals.slice(Math.max(allFinishedGoals.length - 5, 0))
    const allDefaultGoals = await Goal.find({})
    let lastFiveFinishedGoals = []
    _lastFiveFinishedGoals.map(goal => {
        allDefaultGoals.map(dgoal => {
            if(goal.goalId === dgoal._id.toString()) lastFiveFinishedGoals.push(dgoal)
        })
    })
    lastFiveFinishedGoals = lastFiveFinishedGoals.reverse() // <- reverse to make 0 the latest addition

    // calculate timeLogged
    let totalTimeLogged = 0
    allFinishedGoals.map(goal => totalTimeLogged += parseInt(goal.minutesLogged))

    // calculate pointsScored
    let totalPointsScored = 0
    allFinishedGoals.map(goal => totalPointsScored += goal.points * (goal.minutesLogged / 15) * .25)

    // calculate favoriteGoal
    // this feels like one of those 
    const goalsByLogs = {}
    allFinishedGoals.map(goal => {
        if(!goalsByLogs[goal.goalId.toString()]) {
            goalsByLogs[goal.goalId.toString()] = 1
        } else {
            goalsByLogs[goal.goalId.toString()] += 1
        }
    })
    let favoriteGoalCount = 0
    let favoriteGoalId = ''
    for(const goal in goalsByLogs) {
        if(!favoriteGoalCount || goalsByLogs[goal] > favoriteGoalCount) {
            favoriteGoalCount = goalsByLogs[goal]
            favoriteGoalId = goal
        } 
    }
    const favoriteGoal = allDefaultGoals.find(goal => goal.id === favoriteGoalId)

    // return total time and points logged for the past week, month, 3 months, 6 months, and year
    // use moment.unix() for all times
    const week = moment().subtract(1, 'week').unix() * 1000
    const month = moment().subtract(1, 'month').unix() * 1000
    const threeMonth = moment().subtract(3, 'month').unix() * 1000
    const sixMonth = moment().subtract(6, 'month').unix() * 1000
    const year = moment().subtract(1, 'year').unix() * 1000

    const finishedGoalsLastWeek = allFinishedGoals.filter(goal => week < moment(goal.timeCompleted).unix() * 1000 )
    const finishedGoalsLastMonth = allFinishedGoals.filter(goal => month < moment(goal.timeCompleted).unix() * 1000 )
    const finishedGoalsLastThreeMonth = allFinishedGoals.filter(goal => threeMonth < moment(goal.timeCompleted).unix() * 1000 )
    const finishedGoalsLastSixMonth = allFinishedGoals.filter(goal => sixMonth < moment(goal.timeCompleted).unix() * 1000 )
    const finishedGoalsLastYear = allFinishedGoals.filter(goal => year < moment(goal.timeCompleted).unix() * 1000 )
    const finishedGoalsAllTime = allFinishedGoals

    const oneWeek = { totalTimeLogged: 0, totalPointsScored: 0 }
    const oneMonth = { totalTimeLogged: 0, totalPointsScored: 0 }
    const threeMonths = { totalTimeLogged: 0, totalPointsScored: 0 }
    const sixMonths = { totalTimeLogged: 0, totalPointsScored: 0 }
    const oneYear = { totalTimeLogged: 0, totalPointsScored: 0 }
    const allTime = { totalTimeLogged: 0, totalPointsScored: 0 }

    const finishedTimes = [ finishedGoalsLastWeek, finishedGoalsLastMonth, finishedGoalsLastThreeMonth, finishedGoalsLastSixMonth, finishedGoalsLastYear, finishedGoalsAllTime ]
    const timeLogs = [ oneWeek, oneMonth, threeMonths, sixMonths, oneYear, allTime ]

    let log = 0
    for(const time in finishedTimes) {
        finishedTimes[time].map(goal => {
            timeLogs[log].totalTimeLogged += parseInt(goal.minutesLogged)
            timeLogs[log].totalPointsScored += goal.points * ((parseInt(goal.minutesLogged) / 15) * .25)
        })
        log++
    }

    return {
        lastFiveFinishedGoals,
        totalGoalsCompleted: allFinishedGoals.length,
        totalTimeLogged,
        favoriteGoal,
        favoriteGoalCount,
        totalPointsScored,
        oneWeek,
        oneMonth,
        threeMonths,
        sixMonths,
        oneYear,
        allTime,
    }
}

// this endpoint is to calculate a group power ranking report for a single group
// takes in a groupId as an argument
// returned is an object containing 2 arrays.
// The first array is a power ranking report for all weeks the group has existed
// The second array is a power ranking report for all months the group has existed
const calcGroupPowerRanking = async ( parent, { groupId }, { userJWT }, info ) => {
    // auth patron
    let errors = []
    const decoded = decodeJWT(userJWT)
    if(decoded.status === 'error') {
        errors.push(decoded.msg)
        return { errors }
    }

    // make sure group exists, if it does get all of the userIds in the group
    const group = await Group.findById({ _id: groupId })
    if(!group) {
        errors.push('Group Not Found')
        return { errors }
    }

    // initialize arrays to be returned
    let allTimeRankingsWeeks = group.groupMembers.map(userId => ({ userId, recordsWon: 0 }))
    let allTimeRankingsMonths = group.groupMembers.map(userId => ({ userId, recordsWon: 0 }))

    // grab every finishedGoal completed for the group
    const allFinishedGoals = await FinishedGoal.find({ groupId }).sort('timeCompleted')

    // don't look for finishedGoals stats if there aren't any to return
    if(!allFinishedGoals.length) return

    // define time, idk how many of these will be needed
    const millisecondsInAMonth = 2592000000
    const millisecondsInAWeek = 604800000
    const millisecondsInADay = 86400000

    // calculate how many total days, weeks, and months have been played by the group
    const oldestTime = allFinishedGoals[0].timeCompleted
    const youngestTime = allFinishedGoals[ allFinishedGoals.length - 1 ].timeCompleted
    const numOfWeeks = Math.ceil(((moment(youngestTime).unix() - moment(oldestTime).unix()) * 1000) / millisecondsInAWeek)
    const numOfDays = Math.ceil(((moment(youngestTime).unix() - moment(oldestTime).unix()) * 1000) / millisecondsInADay)
    const numOfMonths = ((moment(youngestTime).month() - moment(oldestTime).month()) + 1)

    // cycle through all weeks, get the # of weeks won for every user
    let time = youngestTime
    for(let i = 0; i < numOfWeeks; i++) {
        const userScores = calcUserScore_helperFunction({
            userIds: group.groupMembers,
            allFinishedGoals,
            startTime: moment(time).startOf('week').unix() * 1000,
            endTime: moment(time).endOf('week').unix() * 1000
        })

        // if there is at least 1 record for the entire week, calc the winner of that given week
        // increment the records won for that given user
        if(userScores[0].score > 0) {
            allTimeRankingsWeeks.map(log => {
                if(log.userId === userScores[0].userId) {
                    log.recordsWon++
                }
            })
            
        }

        // after week is calculated, move back to the last week
        time = moment(time).subtract(1, 'week')
    }

    // cycle through all months, calculate the score for every user for every month the group has played
    time = youngestTime
    for(let i = 0; i < numOfMonths; i++) {
        const userScores = calcUserScore_helperFunction({
            userIds: group.groupMembers,
            allFinishedGoals,
            startTime: moment(time).startOf('month').unix() * 1000,
            endTime: moment(time).endOf('month').unix() * 1000
        })

        // if there is at least 1 record for the entire week, calc the winner of that given week
        // increment the records won for that given user
        if(userScores[0].score > 0) {
            allTimeRankingsMonths.map(log => {
                if(log.userId === userScores[0].userId) {
                    log.recordsWon++
                }
            })
        }

        // after week is calculated, move back to the last week
        time = moment(time).subtract(1, 'month')
    }

    // sort all of the records by winners to losers
    // if a user does not have a single week or month won, don't return the user log
    allTimeRankingsWeeks.sort((a, b) => (parseInt(a.recordsWon) < parseInt(b.recordsWon)) ? 1 : -1)
    allTimeRankingsMonths.sort((a, b) => (parseInt(a.recordsWon) < parseInt(b.recordsWon)) ? 1 : -1)
    return {
        allTimeRankingsWeeks: allTimeRankingsWeeks.filter(log => log.recordsWon > 0),
        allTimeRankingsMonths: allTimeRankingsMonths.filter(log => log.recordsWon > 0)
    }
}

module.exports = {
    calcUserStat,
    calcGroupPowerRanking
}