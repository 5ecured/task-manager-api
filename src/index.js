const express = require('express');
const app = express();
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const port = process.env.PORT 
const jwt = require('jsonwebtoken')
require('./db/mongoose') //We dont need to store in a var because when we require, the file runs, meaning database connection is established and that is all we need








app.use(express.json()) //This will parse incoming JSON to an object...
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server up on', port)
})

