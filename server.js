const { GraphQLServer, PubSub } = require('graphql-yoga')

// connect to db
require('./config/db')()

// graphql subscriptions
const pubsub = new PubSub()

const resolvers = require('./resolvers')

const server = new GraphQLServer({
    typeDefs: './schema.graphql',
    resolvers,

    context: ({ request }) => {

        if(!request) return { userJWT: null, pubsub }

        // No AuthToken sent
        if(!request.headers.authorization) {
            return {
                userJWT: null,
                pubsub
            }
        }

        return {
            userJWT: request.headers.authorization.substring(7),
            pubsub
        }
    }
})

server.start(({ port }) => {
    console.log(`Server is running on port ${ port }`)
})