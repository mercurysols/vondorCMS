var config=require('./config');
var express=require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var app=express();
app.set('trust proxy', 1); // trust first proxy

//middleware of seesion
app.use(session({
    secret: 'vondos',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge : 7*24*60*60*1000,
        secure: false
    }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

global.__basedir = __dirname;
// app.use('/assets',express.static('assets'))
app.use(express.static(__dirname + '/assets'));


//setting view engine as ejs template
app.set('view engine','ejs');
//telling the path of Views
app.set('views',__dirname+'/views');



var login=require('./routes/auth/login');
var project=require('./routes/project/project');
var listing=require('./routes/listing/listing');
var model=require('./routes/project/model/model');
var floor=require('./routes/floorplan/floorplan');

app.use('/',login);
app.use('/project',project);
app.use('/listing',listing);
app.use('/model',model);
app.use('/floorplan',floor);


module.exports=app;

var port = process.env.PORT || config.server.port;

app.listen(port,function () {
    console.log("server is listening at "+ port);
});