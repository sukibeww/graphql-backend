const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const app = express();

mongoose.connect(process.env.MONGODB, {useUnifiedTopology: true, useNewUrlParser: true});
mongoose.connection.once('open', () => {
    console.log("connected to the database")
})

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

app.listen(5000, ()=> {
    console.log(("Listening to port 5000"))
});