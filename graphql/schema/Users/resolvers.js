const uuidV4 = require("uuid/v4");
const bcrypt = require("bcrypt");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const path = require("path");
const nodemailer = require("nodemailer");
const { assertValidSession } = require("../../authentication");
// set expired session (minute)
const DEFAULT_EXPIRIDITY = 5;
const dayjs = require("dayjs");

const smtpTransport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "",
    pass: ""
  }
});

const resolvers = {
  Query: {
    allAccounts: async (self, params, context) => {
      assertValidSession(context.activeSession);
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
          if (!foundAccount.isVerified) {
            throw new Error("Account not verified! please check your email");
          }
          let session = await createSession({
            account: foundAccount,
            context,
            expiresIn: DEFAULT_EXPIRIDITY
          });
          fs.writeFileSync(
            path.join(__dirname, "../../session.json"),
            JSON.stringify(session)
          );

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
          if (!foundAccount.isVerified) {
            throw new Error("Account not verified! please check your email");
          }
          let session = await createSession({
            account: foundAccount,
            context,
            expiresIn: DEFAULT_EXPIRIDITY
          });
          fs.writeFileSync(
            path.join(__dirname, "../../session.json"),
            JSON.stringify(session)
          );

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
        isVerified: false,
        _createdAt: new Date().toISOString(),
        _updatedAt: new Date().toISOString()
      };

      await context.collection("Accounts").insertOne(newAccount);

      let host = process.env.GRAPHQL_API_HOST;
      let port = process.env.APP_BIND_PORT;
      let link = `http://${host}:${port}/verify-email?id=` + newAccount._id;
      let mailOptions = {
        to: params.input.email,
        subject: "Please confirm your Email account",
        html:
          "Hello,<br> Please Click on the link to verify your email.<br><a href=" +
          link +
          ">Click here to verify</a>"
      };
      smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
          console.log(error);
        } else {
          console.log("Message sent: " + response.message);
        }
      });
      return "Account created successfully";
    },
    verifyAccount: async (self, params, context) => {
      const foundAccount = await context.collection("Accounts").findOne({
        _id: params._id,
        _deletedAt: {
          $exists: false
        }
      });
      if (!foundAccount) {
        return false;
      }
      await context.collection("Accounts").updateOne(
        {
          _id: foundAccount._id
        },
        {
          $set: {
            isVerified: true
          }
        }
      );
      return true;
    },
    logOut: async (self, params, context) => {
      if (!context.activeSession) {
        throw new Error(`You already logged out!`);
      }
      await context.collection("AccountSessions").deleteOne({
        _id: context.activeSession._id
      });

      return "successfully logout!";
    }
  }
};
exports.resolvers = resolvers;

const createSession = async ({ account, expiresIn, context }) => {
  const sessionId = uuidV4();
  delete account.password;
  let token = expiresIn
    ? jwt.sign({ sessionId, accountId: account._id }, "SECRET", {})
    : jwt.sign({ sessionId, accountId: account._id }, "SECRET", { expiresIn });
  const newSession = {
    _id: sessionId,
    accountId: account._id,
    token: "token-" + token,
    expiresIn,
    _createdAt: new Date().toISOString(),
    _updatedAt: new Date().toISOString()
  };
  await context.collection("AccountSessions").insertOne(newSession);

  return newSession;
};
