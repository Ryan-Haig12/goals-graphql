
const typeDefs = `
    type Query {
        createUser(
            name: String!
            email: String!
            password: String!
            password2: String!
        ): User!
        getUser(id: ID, email: String): User!
        loginUser(email: String!, password: String!): User!
        deleteUser(id: ID!): User!
    }

    type User {
        id: ID
        name: String
        email: String
        password: String
        dateCreated: String
        errors: [ String ]
        totalScoreAllTime: Int
        totalScoreDay: Int
        totalScoreWeek: Int
        totalScoreMonth: Int
        totalScoreGroup: [ TotalScoreGroup ]
        groups: [ String ]
        completedGoals: [ String ]
        jwt: String
    }

    type Goal {
        id: ID!
        title: String!
        notes: [ String ]
        points: Int!
        completed: Boolean
        category: String
    }

    type TotalScoreGroup {
        groupId: String
        score: Int
    }
`

module.exports = typeDefs