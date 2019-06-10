var express = require("express");
var session = require('express-session');
var app = express();
var path = require("path");
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'get it right get it tight',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60000
    }
}))
const flash = require('express-flash');
app.use(flash());
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/message_board');

var CommentSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 3},
    content: {type: String, required: true, minlength: 7}
}, {timestamps: true });

var MessageSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 3},
    content: {type: String, required: true, minlength: 7},
    comments: [CommentSchema]
}, {timestamps: true });


mongoose.model('Message', MessageSchema);
var Message = mongoose.model('Message');
mongoose.model('Comment', CommentSchema);
var Comment = mongoose.model('Comment');
mongoose.Promise = global.Promise;


app.use(express.static(path.join(__dirname, "./static")));
app.set('views', path.join(__dirname, "./views"));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
    Message.find({}).sort({createdAt: -1}).exec(function(err, messages){
        console.log(messages);
        res.render('index', {data: messages})
    })
})

app.post('/create', function(req, res){
    console.log("POST DATA", req.body);
    var message = new Message();
    message.name = req.body.name;
    message.content = req.body.content;
    message.save(function(err){
        if(err){
            console.log("something went wrong", err);
        } else {
            console.log("successfully added")
        }
        res.redirect('/')
    })
})

app.post('/create_comment/:id', function(req, res){
    console.log("POST DATA", req.body);
    var comment = new Comment();
    comment.name = req.body.name;
    comment.content = req.body.content;
    comment.save(function(err){
        if(err){
            console.log("something went wrong", err);
        } else {
            console.log(comment);
            Message.findOneAndUpdate({_id: req.params.id}, {$push: {comments: comment}}, function(err){
                if(err){
                    console.log("something went wrong", err);
                } else {
                    console.log("successfully added")
                    console.log("******************************")
                }
                res.redirect('/')
            });

        }

    })
})

// app.get('/mongooses/destroy/:id', function(req,res){
//     console.log("in delete")
//     Animal.findOne({_id: req.params.id}, function(err,animals){
//         animals.remove(function(err){
//             if(err){
//                 console.log("something went wrong", err);
//             } else {
//                 console.log("successfully deleted")
//             }
//             res.redirect('/')
//         })
//     })
// })




app.listen(8000, function() {
    console.log("listening on port 8000");
})
