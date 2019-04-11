# express-graphql-graphdb-server

Serverless RESTful server with DynamoDB

## Installation

Use the package manager [npm](https://www.npmjs.com/get-npm) to install express-graphql-graphdb-server dependencies.

```bash
npm install
```

## Usage

```bash
npm start
```

## Notes


[Google Auth](https://developers.google.com/oauthplayground/ )

[Neo4J](https://neo4j.com/)

[GraphQL](https://graphql.org/learn/)


## Cypher

```bash
CREATE ( node:User { email: '<email>', id:'<id>'} ) RETURN node
```

## Docker 

```bash
docker pull neo4j

docker run --publish=7474:7474 --publish=7687:7687 neo4j
```

## License
[MIT](https://choosealicense.com/licenses/mit/)