const express = require('express');
const myApp = express();
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

myApp.set('views', path.join(__dirname, 'views'));
myApp.use(express.static(__dirname+'/public'));
myApp.set('view engine', 'ejs');
myApp.use(bodyParser.json());
myApp.use(bodyParser.urlencoded({ extended: true }));
myApp.use(methodOverride('_method'));

const mongoose = require('mongoose');
require('dotenv').config();

const port = process.env.PORT || 8000;
const startServer = async () => {   
    console.log(`The server is running on http://localhost:${port}`);
 
    // MongoDB Connection
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Success! Connected to MongoDB")
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }   
 }
 

const Task = mongoose.model('Task', {
    title: { type: String, required: true },
    description: { type: String, required: true },
    duedate: { type: Date, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    completed: { type: Boolean, default: false, required: true }
});

myApp.get('/', (req, res)=>{
    res.render('home', {});
})
myApp.get('/tasks', (req, res)=>{
    Task.find().then((data)=>{
        res.render('viewtask', {data: data});
    }).catch((err)=>{
        console.log(`DB Error: ${err}`);
        res.status(404).send("Error 404");
    });
})
myApp.get('/tasks/:id', (req, res)=>{
    Task.find({_id: req.params.id}).then((data)=>{
        res.render('viewonetask', {data: data});
    }).catch((err)=>{
        res.render('viewonetask', {});
    });
})
myApp.get('/addtasks', (req, res)=>{
    res.render('addtask', {});
})
myApp.post('/tasks', (req, res)=>{
    let completed = false;
    if(req.body.completed=='on'){
        completed = true;
    }
    const task = new Task({
        title: req.body.title,
        description: req.body.description,
        duedate: req.body.duedate,
        priority: req.body.priority,
        completed: completed
    });
    task.save().then((data)=>{
        res.redirect('/tasks');
    }).catch((err)=>{
        console.log(`DB Error: ${err}`);
        res.status(400).send("Error 400");
    });
})
myApp.get('/edittasks/:id', (req, res)=>{
    Task.findOne({_id: req.params.id}).then((data)=>{
        res.render('edittask', {data: data, url: `${req.protocol}://${req.get('host')}/tasks/${data.id}`});
    }).catch((err)=>{
        console.log(`DB Error: ${err}`);
        res.status(404).send("Error 404");
    });
})
myApp.put('/tasks/:id', (req, res)=>{
    let completed = false;
    if(req.body.completed=='on'){
        completed = true;
    }
    Task.findOneAndUpdate({_id: req.params.id},{
        title: req.body.title,
        description: req.body.description,
        duedate: req.body.duedate,
        priority: req.body.priority,
        completed: completed
    }).then((data)=>{
        res.redirect('/tasks');
    }).catch((err)=>{
        console.log(`DB Error: ${err}`);
        res.status(400).send("Error 400");
    });
})
myApp.delete('/tasks/:id', (req, res)=>{
    Task.deleteOne({_id: req.params.id}).then((data)=>{
        res.redirect('/tasks');
    }).catch((err)=>{
        console.log(`DB Error: ${err}`);
        res.status(400).send("Error 400");
    });
})

myApp.listen(port, startServer)