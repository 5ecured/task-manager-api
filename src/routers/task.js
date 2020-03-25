const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')

router.post('/tasks', auth, async (req, res) => {
    //Old way
    // const task = new Task(req.body)

    //New way
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        const savedTask = await task.save();
        res.status(201).send(savedTask)
    } catch(e) {
        res.status(400).send(e)
    }
})

//GET /tasks?completed=true
//GET /tasks?limit=10&skip=20
//GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: Number(req.query.limit),
                skip: Number(req.query.skip),
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch(e) {
        res.status(404).send()
    }
})



router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    
    try {
        // const task = await Task.findById(_id)

        const task = await Task.findOne({_id, owner: req.user._id })

        if(!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch(e) {
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const keys = Object.keys(req.body)
    const allowed = ['description', 'completed']
    const isTrue = keys.every(key => allowed.includes(key))
    const _id = req.params.id;

    if(!isTrue) {
        res.status(400).send({error: 'Invalid updates detected'})
    }

    
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})

        // const task = await Task.findByIdAndUpdate(_id, req.body, {new: true, runValidators: true})
        if(!task) {
            return res.status(404).send()
        }   

        keys.forEach(key => task[key] = req.body[key])
        await task.save()


        res.send(task)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        //const task = await Task.findByIdAndDelete(_id);
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})

        if(!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch(e) {
        res.status(500).send()
    }
})

module.exports = router;