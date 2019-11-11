require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const {
  ApolloServer,
  graphqlExpress,
  graphiqlExpress
} = require("apollo-server-express");
const schema = require("./getSchema");
const { authenticate } = require("./authentication");
const mongodbConnection = require("./mongodbConnection");
const getSession = require("./session.json");
const fetch = require("node-fetch");
const ApolloClient = require("apollo-boost").default;
const { gql } = require("apollo-boost");

global.fetch = fetch;

const start = async () => {
  if (!process.env.GRAPHQL_API_HOST || !process.env.GRAPHQL_API_PORT) {
    console.warn("Incomplete environment variables!");
    process.exit();
  }
  const collection = await mongodbConnection("LOGINSYS");
  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const activeSession = await authenticate({
        session: getSession,
        collection
      });

      return {
        activeSession,
        collection
      };
    },
    cors: true,
    debug: process.env.NODE_ENV !== "production",
    playground: process.env.NODE_ENV !== "production",
    formatError: err => {
      console.log(
        "Apollo Server Error",
        err.message,
        JSON.stringify(err.extensions, null, 4)
      );
      return err;
    }
  });
  const app = express();
  const rest = express();
  app.use(bodyParser.json({ limit: "20mb" }));
  rest.use(bodyParser.json({ limit: "20mb" }));
  server.applyMiddleware({ app });
  const port = parseInt(process.env.GRAPHQL_API_PORT) || 4000;
  const restPort = parseInt(process.env.APP_BIND_PORT) || 4300;

  await app.listen({
    port
  });

  await rest.listen(restPort);
  let uri = `http://${process.env.GRAPHQL_API_HOST}:${port}${server.graphqlPath}`;
  const client = new ApolloClient({
    uri
  });

  rest.get("/verify-email", async (req, res) => {
    let query = await client.mutate({
      mutation: gql`
        mutation verifyAccount($_id: ID!) {
          verifyAccount(_id: $_id)
        }
      `,
      variables: {
        _id: req.query.id
      }
    });

    if (!query.data.verifyAccount) {
      return res.status(200).send("Account not found!");
    }
    return res.status(200).send("Account successfully verified! please login");
  });
  console.log(
    `🚀  Server ready at http://${process.env.GRAPHQL_API_HOST}:${port}${server.graphqlPath}`
  );
};

start();

exports.start = start;
