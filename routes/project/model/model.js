var express = require ("express");
var requestData = require('request');
var app = express();
var router=express.Router();
var config=require('../../../config');
var querystring = require('querystring');

router.get('/addmodel/:id?',function (request,response) {
    var id=request.params.id;
    var url=config.server.host+':'+config.server.port+'/vondos/v1/api/project/project/';
    requestData(url, function (error1, projectResponse, body1) {
        if (!error1 && projectResponse.statusCode == 200) {
            body1=JSON.parse(body1);
            if(request.session.user) {
                response.render('project/model/add',{projectNewId:id,projectList:body1});}
        }else{response.render('error/Error');}
    });
})


router.get('/list/:Id?',function (request,response) {
    var id=request.query.Id;
    var success=request.query.success;
    var url=config.server.host+':'+config.server.port+'/vondos/v1/api/model/projectmodels/'+id;
    requestData(url, function (error, response1, body) {
        if (!error && response1.statusCode == 200) {
            body=JSON.parse(body);
            var url=config.server.host+':'+config.server.port+'/vondos/v1/api/project/project/'+id;
            requestData(url, function (error1, projectResponse, body1) {
                if (!error1 && projectResponse.statusCode == 200) {
                    body1=JSON.parse(body1);
                    if(success==1){if(request.session.user) {
                            response.render('project/model/list',{data:body,project:body1,success:1});}
                    }else{ if(request.session.user) {
                            response.render('project/model/list',{data:body,project:body1,success:0});
                        }}
                }else{
                    response.render('error/Error');}
            });}else{
            response.render('error/Error');}
    });
})


router.post('/add',function (request,response) {
    var url=config.server.host+':'+config.server.port+'/vondos/v1/api/model/model/';
    requestData.post(url, {form:{data:request.body}},function (error,msg) {
        if (!error && msg.statusCode == 200) {
            if(msg.body=="-1") {response.render('error/Error');}
            else {response.redirect('/model/list?success=1&Id='+request.body.projectId);}
        }else {response.render('error/Error');}
    });
});


router.get('/edit/:id?',function (request,response) {
    var id=request.params.id;
    var url=config.server.host+':'+config.server.port+'/vondos/v1/api/model/model/'+id;
    requestData(url, function (error, response1, body) {
        if (!error && response1.statusCode == 200) {
            body=JSON.parse(body);
            var url=config.server.host+':'+config.server.port+'/vondos/v1/api/project/project/';
            requestData(url, function (error1, projectResponse, body1) {
                if (!error1 && projectResponse.statusCode == 200) {
                    body1=JSON.parse(body1);
                    if(request.session.user) {
                        response.render('project/model/edit',{data:body,projectList:body1});}
                }else{response.render('error/Error');}
            });}
        else{response.render('error/Error');}
    });
})


router.get('/delete/:id?',function (request,response) {
    var id=request.query.modelId;
    var url=config.server.host+':'+config.server.port+'/vondos/v1/api/model/delete/'+id;
    requestData(url, function (error, response1, body) {
        if (!error && response1.statusCode == 200) {
            response.redirect('/model/list?success=1&Id='+request.query.projectId);}
            else{response.render('error/Error');}
    });})


router.post('/edit',function (request,response) {
    var url=config.server.host+':'+config.server.port+'/vondos/v1/api/model/update/';

    requestData.post(url, {form:{data:request.body}},function (error,msg) {
        if (!error && msg.statusCode == 200){

            if(msg.body=="-1") {response.render('error/Error');}
            else {response.redirect('/model/list?success=1&Id='+request.body.projectId);}

        }else {response.render('error/Error');}
    });});


module.exports=router;