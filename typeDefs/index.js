
const typeDefs = `
    type Query {
        goalTest: Goal!
        getGoal(id: ID): Goal!
        getUser(id: ID, name: String): User!
    }

    type User {
        id: ID!
        name: String!
        email: String!
        password: String!
        dateCreated: Int
    }

    type Goal {
        id: ID!
        title: String!
        notes: [String]
        points: Int!
        completed: Boolean
        category: String
    }
`

module.exports = typeDefs