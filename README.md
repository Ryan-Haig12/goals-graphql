# Goals-Graphql
This is the GraphQL API dealing with the goals project.

# Goals Overview
The goals game derrives from a game my coworker plays with his friends. The idea is to have different goals/tasks for the players in the group to aspire to complete on a day to day basis.
There are 37 different goals that exist in the database, these are called 'default goals' The goals come in five seperate categories, Physical, Nutrition, Mental, Emotional, and Spiritual.
Each category contains five to thirteen individual goals. Each goal has a different task such as hiking, running, having family time, reading, yoga, writing, etc. 
Each default goal has a points value of 1, meaning that if a user logs time on a default goal for 60 minutes they recieve 1 point for that day, week, and month.
It is up to individual groups to determine if they are competing on a weekly or monthly basis.

# Getting Started
The goals project has two different databases, one for the PROD/Heroku build and one for the DEV/local build. <b>Ideally</b> it would be easiest for anyone interested in interacting with this API to use the PROD/Heroku build as attempting to run this locally will expose database credential issues.
The PROD endpoint can be found here: https://goals-graphql.herokuapp.com/. This url works as both the web service endpoint and the GraphQL Playground thanks to graphql-yoga.

A lot of endpoints/resolvers in this API require authentication. Authentication is done via JSON Web Tokens and are assigned to a user upon registration and login. To create a new user:
```graphql
mutation {
  createUser(data: {
    name: "New User"
    email: "NewGuyOnTheBlock@example.com"
    password: "charizard06_99"
    password2: "charizard06_99"
  }) {
    id
    email
    jwt
    name
    errors
    dateCreated
  }
}
```

You should recieve a response with a jwt token. To ensure registration worked, run this query with your new jwt in the http headers:
```graphql
query {
  getUser(email: "haigryan@gmail.com") {
    id
    email
    jwt
    name
    errors
    dateCreated
  }
}

{
  "Authorization": "Bearer { JWT_TOKEN_HERE }"
}
```

