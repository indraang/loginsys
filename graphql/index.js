require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const {ApolloServer, graphqlExpress, graphiqlExpress } = require("apollo-server-express");
const schema = require("./getSchema");
const mongodbConnection = require("./mongodbConnection");

// const start = async () => {
//   let app = express();
//   const collection = await mongodbConnection("LOGINSYS");

//   app.use(
//     "/graphql",
//     bodyParser.json({ limit: "20mb" }),

//     graphqlExpress((req, res) => {
//       try {
//         return {
//           schema,
//           context: {
//             collection
//           }
//         };
//       } catch (err) {
//         console.log("graphqlExpress Error:", err);
//         throw new Error("Internal Server Error");
//       }
//     })
//   );
//   const dev = process.env.NODE_ENV !== "production";
//   if (dev) {
//     console.log("Attaching /graphiql");
//     app.use(
//       "/graphiql",
//       graphiqlExpress({
//         endpointURL: "/graphql"
//       })
//     );
//   }
//   const PORT = process.env.GRAPHQL_API_PORT || 3000;
//   console.log(PORT);
//   const serverAfterListening = app.listen(PORT, () => {
//     console.log(
//       `GraphQL API server running on http://${process.env.GRAPHQL_API_HOST}:${PORT}/graphql`
//     );
//   });
// };
// start();
const start = async () => {
  if (!process.env.GRAPHQL_API_HOST || !process.env.GRAPHQL_API_PORT) {
    console.warn("Incomplete environment variables!");
    process.exit();
  }
  const collection = await mongodbConnection("LOGINSYS");
  const server = new ApolloServer({
    schema,
    context: () => {
      return {
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
  app.use(bodyParser.json({ limit: "20mb" }));
  server.applyMiddleware({ app });
  const port = parseInt(process.env.GRAPHQL_API_PORT) || 4000;
  await app.listen({
    port
  });
  console.log(
    `🚀  Server ready at http://localhost:${port}${server.graphqlPath}`
  );
};

start();

exports.start = start;
