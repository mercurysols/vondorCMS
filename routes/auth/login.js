var express = require ("express");
var requestData = require('request');
var app = express();
var router=express.Router();
var config=require('../../config');


router.get("/",function (request,response) {


    response.render("auth/login",{
        layout:false,
        session: request.session
    });
});

router.get('/dashboard',function (request,response) {
    response.render('auth/home');
})
router.post('/',function (request,response) {
    request.session.user="admin";
    var url=config.server.host+':'+config.server.port+'/vondos/v1/api/signin/';

    requestData.post(url, {form:{username:request.body.username,password:request.body.pass_word}},function (error,msg) {
        if (!error && msg.statusCode == 200) {
            if(msg.body=="-1")
            {
                response.render('error/Error');
            }else {
                if(request.session.user)
                {
                    response.render('auth/home');
                }
            }

        }else {
            response.render('error/Error');
        }
    });
});





module.exports=router;