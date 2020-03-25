const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({  
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        },
        unique: true
    },
    age: {
        type: Number,
        default: 0,
        //below is a custom validation
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Please dont use the word "password" in your password!')
            }
        }
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            }
        }
    ],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.methods.generateAuthToken = async function() {
    const user = this;

    const token = jwt.sign({_id: String(user._id)}, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token})
    await user.save()

    return token
}


userSchema.virtual('tasks', { //virtual is a relationship between two entities (user and task)
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner' //this refers to the field on the tasks
}) 


userSchema.methods.toJSON = function() {
    const user = this;

    //below will provide the raw user object data. toObject is provided by mongoose
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

//The below is creating a new method, so in the router, we can call User.findByCredentials
userSchema.statics.findByCredentials = async (email, password) => {
    //First, find the user by email
    const user = await User.findOne({email}) //we are looking for a user whose email is equal to the 1st arg. shorthand syntax.  
    console.log(user)
    if(!user) {
        throw new Error('Unable to login')
    }

    //now we verify that passowrd using the compare function of bcrypt
    const isMatch = await bcrypt.compare(password, user.password) //Looking at the docs, 1st arg is plain text password, 2nd arg is hashed password
    console.log(isMatch)
    if(!isMatch) {
        throw new Error('Unable to login')
    }

    return user;
}


//Hash the plain text password before saving
userSchema.pre('save', async function(next) { //2nd arg must be standard function because the THIS binding is important. THIS refers to the document being saved
    const user = this //Just to make more sense, we use USER instead of THIS

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    next()
}) 

//Delete user tasks when user is removed
userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({ owner: user._id}) // delete all tasks where the owner id is equal to the user id
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User