const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
exports.authenticate = async ({ session, collection }) => {
  try {
    const token = session.token;
    if (!token) {
      return null;
    }
    foundSession = await collection("AccountSessions").findOne({
      _id: session._id,
      token: session.token
    });

    if (!foundSession) {
      return null;
    }
    Account = await collection("Accounts").findOne({
      _id: foundSession.accountId
    });

    const timeSession = dayjs(session._createdAt)
      .add(session.expiresIn, "minute")
      .toISOString();
    if (!Account) {
      return null;
    }

    if (timeSession < dayjs().toISOString()) {
      await collection("AccountSessions").deleteOne({
        _id: foundSession._id
      });
      return null;
    }
    const authenticationResult = {
      _id: foundSession._id,
      ...foundSession,
      Account,
      token
    };
    // console.log(authenticationResult);
    return authenticationResult;
  } catch (err) {
    console.log("AUTHENTICATE ERROR:", err.message);
    return null;
  }
};

exports.assertValidSession = session => {
  // if (process.env.NODE_ENV !== "production") {
  //   return;
  // }
  if (!session) {
    console.log("SESSION ERROR: Undefined session");
    throw new Error("Undefined session");
  }
  if (!session.Account || !session.Account._id) {
    console.log("SESSION ERROR: Invalid account");
    throw new Error("Invalid account");
  }
};
exports.DEFAULT_EXPIRIDITY = "6h";
