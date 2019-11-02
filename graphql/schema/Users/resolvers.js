const uuidV4 = require("uuid/v4");
const bcrypt = require("bcrypt");
const resolvers = {
  Query: {
    allAccounts: async (self, params, context) => {
      const Accounts = await context
        .collection("Accounts")
        .find()
        .toArray();
      return Accounts;
    }
  },

  Mutation: {
    signIn: async (self, params, context) => {
      if (params.username && params.password) {
        const foundAccount = await context.collection("Accounts").findOne({
          username: params.username,
          _deletedAt: {
            $exists: false
          }
        });
        if (!foundAccount) {
          throw new Error("Invalid username!");
        }
        if (bcrypt.compareSync(params.password, foundAccount.password)) {
          return "Successfully login!";
        } else {
          throw new Error("Invalid password!");
        }
      } else if (params.email && params.password) {
        const foundAccount = await context.collection("Accounts").findOne({
          email: params.email,
          _deletedAt: {
            $exists: false
          }
        });
        if (!foundAccount) {
          throw new Error("Invalid email!");
        }
        if (bcrypt.compareSync(params.password, foundAccount.password)) {
          return "Successfully login!";
        } else {
          throw new Error("Invalid password!");
        }
      } else {
        throw new Error("Invalid username or email or password!");
      }
    },
    signUp: async (self, params, context) => {
      const foundAccount = await context.collection("Accounts").findOne({
        $or: [
          { username: params.input.username },
          { email: params.input.email }
        ],
        _deletedAt: { $exists: false }
      });

      if (foundAccount) {
        throw new Error("Username or Email already taken!");
      }

      let newAccount = {
        _id: uuidV4(),
        ...params.input,
        password: bcrypt.hashSync(params.input.password, 10),
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString()
      };

      await context.collection("Accounts").insertOne(newAccount);
      return "Account created successfully";
    }
  }
};
exports.resolvers = resolvers;
