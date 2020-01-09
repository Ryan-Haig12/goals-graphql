const { GraphQLServer } = require('graphql-yoga')

// connect to db
require('./config/db')()

const typeDefs = require('./typeDefs')
const resolvers = require('./resolvers')

const server = new GraphQLServer({
    typeDefs,
    resolvers
})

server.start(({ port }) => {
    console.log(`Server is running on port ${ port }`)
})