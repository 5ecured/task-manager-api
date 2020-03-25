//CRUD

const {MongoClient, ObjectID} = require('mongodb');

const connectionURL = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-manager';

//connect takes 3 arguments. the url, the options object, and the callback function that runs when we are connected to the db
MongoClient.connect(connectionURL, {useNewUrlParser: true}, (error, client) => {
    if(error) {
        return console.log('Unable to connect to database!')
    }

    const db = client.db(databaseName) //This gives back a database reference. We store in a variable. We can now use it to manipulate the database

    db.collection('tasks').deleteOne({
        description: 'Eat'
    })
        .then(succ => {
            console.log(succ.deletedCount)
        })
        .catch(err => {
            console.log(err)
        })
})