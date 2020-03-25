const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        //Get the token from the postman header
        const token = req.header('Authorization').replace('Bearer ', '') 

        //make sure the token is valid
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        //this token is still part of the tokens array, so we wanna make sure it still exists in there
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})

        if(!user) {
            throw new Error() //no message needed, this is enough to trigger the catch below
        }

        

        //give the route handler access to the user, because user has been authenticated and found
        req.user = user

        //lets add token as well so we can logout
        req.token = token

        //At this stage, the user has been authenticated, so we run the route handler
        next();

    } catch(e) {
        res.status(401).send({error: 'Please authenticate'})
    }
}

module.exports = auth