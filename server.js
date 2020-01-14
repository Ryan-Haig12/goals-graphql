const { GraphQLServer } = require('graphql-yoga')

// connect to db
require('./config/db')()

const resolvers = require('./resolvers')

const server = new GraphQLServer({
    typeDefs: './schema.graphql',
    resolvers,

    context: ({ request }) => {
        // No AuthToken sent
        if(!request.headers.authorization) {
            return {
                userJWT: null
            }
        }

        return {
            userJWT: request.headers.authorization.substring(7)
        }
    }
})

server.start(({ port }) => {
    console.log(`Server is running on port ${ port }`)
})