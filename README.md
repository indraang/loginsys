## LOGIN SYSTEM GRAPHQL

### Installation
* Clone this repository
* add .env inside the destination folder
* add these variables:

```sh
APP_BIND_PORT=<your_app_port>
GRAPHQL_API_HOST=localhost
GRAPHQL_API_PORT=<your_api_port>

LOGINSYS_MONGOD_HOST=localhost
LOGINSYS_MONGOD_PORT=27017
LOGINSYS_MONGOD_DB=<your_db>
LOGINSYS_MONGOD_USERNAME=<username_if_exists>
LOGINSYS_MONGOD_PASSWORD=<password_if_exists>
LOGINSYS_MONGOD_AUTH_SOURCE=<auth_db_if_exists>
```

------------------------------------------

### Running GraphQL API Server
* Using nodemon

```sh
nodemon graphql/index.js
```
* Using yarn
```sh
yarn run dev-api
```