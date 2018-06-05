var express = require ("express");
var requestData = require('request');
var app = express();
var router=express.Router();
var config=require('../../config');


router.get('/addproject',function (request,response) {
    if(request.session.user) {
        response.render("project/add",{
            layout:false,
            session: request.session
        });}})


router.post('/addproject',function (request,response) {
    var url=config.server.host+':'+config.server.port+'/vondos/v1/api/project/project/';
    requestData.post(url, {form:{data:request.body}},function (error,msg) {
        if (!error && msg.statusCode == 200) {
            if(msg.body=="-1") {
                response.render('error/Error');}
                else {response.redirect('/project/list/1');}
        }else {response.render('error/Error');}
    });
});


router.get('/edit/:id?',function (request,response) {
var id=request.params.id;
    var url=config.server.host+':'+config.server.port+'/vondos/v1/api/project/project/'+id;
    requestData(url, function (error, response1, body) {
        if (!error && response1.statusCode == 200) {
            body=JSON.parse(body);
            if(request.session.user) {
                response.render('project/edit',{data:body});}
        }else{response.render('error/Error');}
    });
})


router.get('/photo/:id?',function (request,response) {
    id=request.params.id;
    var url=config.server.host+':'+config.server.port+'/vondos/v1/api/photo/photo?model='+0+'&project='+id;
    requestData(url, function (error1, projectResponse, body1) {
        if (!error1 && projectResponse.statusCode == 200) {
            body1=JSON.parse(body1);
            var url1=config.server.host+':'+config.server.port+'/vondos/v1/api/project/project/'+id;
            requestData(url1, function (error2, projectResponse2, body2) {
                if (!error2 && projectResponse.statusCode == 200) {
                    body2=JSON.parse(body2);
                    if(request.session.user) {
                        response.render('project/photo',{modelId:0,projectId:id,data:body1,projectobject:body2});}
                }else{response.render('error/Error');}
            });
        }else{response.render('error/Error');}
    });
})


router.get('/delete/:id?',function (request,response) {
    var id=request.params.id;
    var url=config.server.host+':'+config.server.port+'/vondos/v1/api/project/delete/'+id;
    requestData(url, function (error, response1, body) {
        if (!error && response1.statusCode == 200) {
            response.redirect('/project/list/1');}
            else{response.render('error/Error');}
    });
})


router.post('/edit',function (request,response) {
    var url=config.server.host+':'+config.server.port+'/vondos/v1/api/project/update/';
    requestData.post(url, {form:{data:request.body}},function (error,msg) {
        if (!error && msg.statusCode == 200) {
            if(msg.body=="-1") {response.render('error/Error');}
            else{response.redirect('/project/list/1');}
        }else {response.render('error/Error');}
    });
});


router.get('/list/:id?',function (request,response) {
    var id=request.params.id;
    var url=config.server.host+':'+config.server.port+'/vondos/v1/api/project/project/';
    requestData(url, function (error, response1, body) {
        if (!error && response1.statusCode == 200) {
            body=JSON.parse(body);
            if(id==1){
                if(request.session.user) {
                    response.render('project/list',{data:body,success:1});}}
            else{if(request.session.user){
                    response.render('project/list',{data:body,success:0});}}}
        else{response.render('error/Error');}
    });
})


module.exports=router;