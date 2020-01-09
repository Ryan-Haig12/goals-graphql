const User = require('../mongooseDataModels/User')

const resolvers = {
    Query: {
        goalTest: () => {
            return {
                title: 'Shoot hoops for an hour',
                notes: [],
                points: 1,
                completed: false,
                category: 'Physical',
            }
        },

        getGoal: (parent, args, ctx, info) => {
            return {
                title: 'Shoot hoops for an hour',
                notes: [],
                points: 1,
                completed: false,
                category: 'Physical',
            }
        },

        getUser: async (parent, args, ctx, info) => {

            const data = await User.find({ name: args.name })
            const { _id, name, email, password } = data[0]

            return {
                id: _id,
                name,
                email,
                password
            }
        },
    }
}

module.exports = resolvers