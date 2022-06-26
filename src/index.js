const express = require('express');
const bodyParser = require('body-parser');
const route = require('./routes/route.js');
const { default: mongoose } = require('mongoose');

const app = express();

app.use(bodyParser.json());                             //middleware for parsing json objects into JS-accessible variables


mongoose.connect("mongodb+srv://mn-pandey:9219591303Am%40n@cluster0.mov0c.mongodb.net/project-Blog1?retryWrites=true&w=majority")
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route);


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
})