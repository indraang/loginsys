const { MongoClient } = require("mongodb");

module.exports = async PREFIX => {
  try {
    let userAndPass = "";
    if (
      process.env[(PREFIX ? PREFIX + "_" : "") + "MONGOD_USERNAME"] &&
      process.env[(PREFIX ? PREFIX + "_" : "") + "MONGOD_PASSWORD"] &&
      process.env[(PREFIX ? PREFIX + "_" : "") + "MONGOD_AUTH_SOURCE"]
    ) {
      userAndPass = `${
        process.env[(PREFIX ? PREFIX + "_" : "") + "MONGOD_USERNAME"]
      }:${process.env[(PREFIX ? PREFIX + "_" : "") + "MONGOD_PASSWORD"]}@`;
    }

    if (
      !process.env[(PREFIX ? PREFIX + "_" : "") + "MONGOD_HOST"] ||
      !process.env[(PREFIX ? PREFIX + "_" : "") + "MONGOD_PORT"] ||
      !process.env[(PREFIX ? PREFIX + "_" : "") + "MONGOD_DB"]
    ) {
      console.log("Incomplete environment variables. Process exitting...");
      process.exit(1);
    }

    const MONGO_URL = `mongodb://${userAndPass}${
      process.env[(PREFIX ? PREFIX + "_" : "") + "MONGOD_HOST"]
    }:${process.env[(PREFIX ? PREFIX + "_" : "") + "MONGOD_PORT"]}/${
      process.env[(PREFIX ? PREFIX + "_" : "") + "MONGOD_DB"]
    }${
      process.env[(PREFIX ? PREFIX + "_" : "") + "MONGOD_AUTH_SOURCE"]
        ? "?authSource=" +
          process.env[(PREFIX ? PREFIX + "_" : "") + "MONGOD_AUTH_SOURCE"]
        : ""
    }`;

    const client = await MongoClient.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    const db = await client.db(
      process.env[(PREFIX ? PREFIX + "_" : "") + "MONGOD_DB"]
    );

    return collectionName => db.collection(collectionName);
  } catch (e) {
    console.log(e);
  }
};
