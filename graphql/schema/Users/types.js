const Account = `
    type Account {
        _id: ID!
        username: String!
        email: String!
        isVerified: Boolean!
        password: String!        
        _createdAt: String!
        _updatedAt: String!
    }
`;

const CreateAccount = `
    input CreateAccount {
      username: String!
      email: String!
      password: String!
    }
`;
const UpdateAccount = `
    input UpdateAccount {
      username: String
      email: String
      password: String
    }
`;

exports.customTypes = [Account, CreateAccount, UpdateAccount];

exports.rootTypes = `
    type Query {
        home: String!
        allAccounts: [Account]
    }

    type Mutation {
        signIn(username: String,email:String,password: String): String!
        signUp(input: CreateAccount): String!
        
        updateAccount(_id: ID!, input: UpdateAccount): String!
        deleteAccount(_id: ID!): String!
        verifyAccount(_id: ID!): Boolean!

        logOut: String!
    }
`;
