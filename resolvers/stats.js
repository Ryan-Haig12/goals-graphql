const moment = require('moment')

const decodeJWT = require('../utils/decodeJWT')
//const CustomGoal = require('../mongooseDataModels/CustomGoal')
const FinishedGoal = require('../mongooseDataModels/FinishedGoal')
const Goal = require('../mongooseDataModels/Goal')
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
    const _lastFiveFinishedGoals = allFinishedGoals.slice(Math.max(allFinishedGoals.length - 6, 0))
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
    let largestGoal = 0
    let favoriteGoalId = ''
    for(const goal in goalsByLogs) {
        if(!largestGoal || goalsByLogs[goal] > largestGoal) {
            largestGoal = goalsByLogs[goal]
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

    const oneWeek = { 
        totalTimeLogged: 0,
        totalPointsScored: 0,
    }
    const oneMonth = { 
        totalTimeLogged: 0,
        totalPointsScored: 0,
    }
    const threeMonths = { 
        totalTimeLogged: 0,
        totalPointsScored: 0,
    }
    const sixMonths = { 
        totalTimeLogged: 0,
        totalPointsScored: 0,
    }
    const oneYear = { 
        totalTimeLogged: 0,
        totalPointsScored: 0,
    }

    const finishedTimes = [ finishedGoalsLastWeek, finishedGoalsLastMonth, finishedGoalsLastThreeMonth, finishedGoalsLastSixMonth, finishedGoalsLastYear ]
    const timeLogs = [ oneWeek, oneMonth, threeMonths, sixMonths, oneYear ]

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
        totalPointsScored,
        oneWeek,
        oneMonth,
        threeMonths,
        sixMonths,
        oneYear,
    }
}

module.exports = {
    calcUserStat
}