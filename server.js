const { GraphQLServer } = require('graphql-yoga')

// connect to db
require('./config/db')()

const resolvers = require('./resolvers')

const server = new GraphQLServer({
    typeDefs: './schema.graphql',
    resolvers
})

server.start(({ port }) => {
    console.log(`Server is running on port ${ port }`)
})