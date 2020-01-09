const { GraphQLServer } = require('graphql-yoga')

// example goal
const typeDefs = `
    type Query {
        id: ID!
        title: String!
        notes: [String]
        points: Int!
        completed: Boolean
        category: String
    }
`

const resolvers = {
    Query: {
        title: () => {
            return 'Shoot hoops for an hour'
        },
        notes: () => {
            return []
        },
        points: () => {
            return 1
        },
        completed: () => {
            return false
        },
        category: () => {
            return 'Physical'
        },
    }
}

const server = new GraphQLServer({
    typeDefs,
    resolvers
})

server.start(({ port }) => {
    console.log(`Server is running on port ${ port }`)
})