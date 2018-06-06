var express = require ("express");
var requestData = require('request');
var app = express();
var router=express.Router();
var config=require('../../config');
var newPathAWS = require('../../aws-credientials.json');
var fs=require("fs");
var sizeOf = require('image-size');
var AWS = require('aws-sdk');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();


router.get('/photo/:id?',function (request,response) {
    id=request.params.id;
    var url=config.server.host+':'+'/vondos/v1/api/photo/photo?model='+id+'&project=0';
    requestData(url, function (error1, projectResponse, body1) {
        if (!error1 && projectResponse.statusCode == 200) {
            body1=JSON.parse(body1);
            var url1=config.server.host+':'+'/vondos/v1/api/model/model/'+id;
            requestData(url1, function (error2, projectResponse2, body2) {
                if (!error2 && projectResponse2.statusCode == 200) {
                    if(body2!=""){ body2=JSON.parse(body2);}
                    var url2=config.server.host+':'+'/vondos/v1/api/project/project/'+body2.projectId;
                    requestData(url2, function (error3, projectResponse3, body3) {
                        if (!error3 && projectResponse3.statusCode == 200) {
                            if(body3!=""){body3=JSON.parse(body3);}
                            if(request.session.user) {
                                response.render('project/photo',{modelId:id,projectId:null,data:body1,modelobject:body2,projectobj:body3});}}
                        else{response.render('error/Error');}
                    });}
                else{response.render('error/Error');}
            });}
        else{response.render('error/Error');}
    });
})


router.post('/photo',multipartMiddleware,function (request,response) {
    var newPathAWS='aws-credientials.json';
    AWS.config.loadFromPath(newPathAWS);
    var file = request.files.file;
    var projectId=request.body.projectId;
    var modelId=request.body.modelId;
    var fileformat=file.name.split('.')[1].toUpperCase();
    sizeOf(file.path, function (err, dimensions) {
        if((dimensions.width==600&& dimensions.height==600 && projectId!="" && fileformat=="JPG")||(dimensions.width==600&& dimensions.height==1200 && projectId!="" && fileformat=="JPG")||(dimensions.width==1000&& dimensions.height==1000 && modelId!="" &&fileformat=="JPG"))
        {
            fs.readFile(file.path, function (err, data) {
                if (err) throw err; // Something went wrong!
                var s3bucket = new AWS.S3({params: {Bucket: 'vondos'}});
                s3bucket.createBucket(function () {
                    var params = {
                        Key: file.originalFilename, //file.name doesn't exist as a property
                        Body: data
                    };
                    s3bucket.upload(params, function (err, data) {
                        fs.unlink(file.path, function (err) {
                            if (err){console.error(err);}
                            console.log('Temp File Delete');
                        });
                        console.log("PRINT FILE:", file);
                        if (err) {console.log('ERROR MSG: ', err);}
                        else {console.log('Successfully uploaded data');
                            var urlParams = {Bucket: 'vondos', Key: file.originalFilename};
                            s3bucket.getSignedUrl('getObject', urlParams, function(err, url1){
                                var url=config.server.host+':'+'/vondos/v1/api/photo/photo/';
                                requestData.post(url, {form:{url:url1,projectId:request.body.projectId,photoDescription:request.body.photoDescription,modelId:request.body.modelId}},function (error,msg) {
                                    if (!error && msg.statusCode == 200) {
                                        if(msg.body=="-1") {
                                            response.render('error/Error');}
                                        else {if(request.body.modelId!=0) {
                                            response.redirect('/floorplan/Photo/'+request.body.modelId+'?errorId=0');}
                                        else{response.redirect('/project/photo/'+request.body.projectId+'?errorId=0');}}}
                                    else {response.render('error/Error');}
                                });
                            })
                        }
                    });
                });
            });
        }else{
            if(request.body.modelId!=0) {
                response.redirect('/floorplan/Photo/'+request.body.modelId+'?errorId=1');}
            else{response.redirect('/project/photo/'+request.body.projectId+'?errorId=1');}

        }
    });

})


router.get('/list/:Id?',function (request,response) {
    var id=request.params.Id;
    var url=config.server.host+':'+'/vondos/v1/api/model/projectmodels/'+id;
    requestData(url, function (error, response1, body) {
        if (!error && response1.statusCode == 200) {
            body=JSON.parse(body);
            var url=config.server.host+':'+'/vondos/v1/api/project/project/'+id;
            requestData(url, function (error1, projectResponse, body1) {
                if (!error1 && projectResponse.statusCode == 200) {
                    body1=JSON.parse(body1);
                    if(request.session.user) {
                        response.render('project/model/list',{data:body,project:body1});}}
                else{response.render('error/Error');}
            });}
        else{response.render('error/Error');}
    });
})


router.post('/add',function (request,response) {
    var url=config.server.host+':'+'/vondos/v1/api/model/model/';
    requestData.post(url, {form:{data:request.body}},function (error,msg) {
        if (!error && msg.statusCode == 200) {
            if(msg.body=="-1") {
                response.render('error/Error');}
            else {response.redirect('/model/list/'+request.body.projectId);}}
        else {response.render('error/Error');}
    });
});


router.get('/edit/:id?',function (request,response) {
    var id=request.params.id;
    var url=config.server.host+':'+'/vondos/v1/api/model/model/'+id;
    requestData(url, function (error, response1, body) {
        if (!error && response1.statusCode == 200) {
            body=JSON.parse(body);
            var url=config.server.host+':'+'/vondos/v1/api/project/project/';
            requestData(url, function (error1, projectResponse, body1) {
                if (!error1 && projectResponse.statusCode == 200) {
                    body1=JSON.parse(body1);
                    if(request.session.user) {
                        response.render('project/model/edit',{data:body,projectList:body1});}}
                else{response.render('error/Error');}
            });}
        else{response.render('error/Error');}
    });
})


router.get('/delete/:id?',function (request,response) {
    var id=request.query.photoId;
    var url=config.server.host+':'+'/vondos/v1/api/photo/delete/'+id;
    requestData(url, function (error, response1, body) {
        if (!error && response1.statusCode == 200) {
            if(request.query.prosection=="success") {
                response.redirect('/project/photo/'+request.query.projectId);}
            else{response.redirect('/floorplan/photo/'+request.query.modelId);}}
        else{response.render('error/Error');}
    });
})


router.post('/edit',function (request,response) {
    var url=config.server.host+':'+'/vondos/v1/api/model/update/';

    requestData.post(url, {form:{data:request.body}},function (error,msg) {
        if (!error && msg.statusCode == 200) {
            if(msg.body=="-1") {
                response.render('error/Error');}
            else {response.redirect('/model/list/'+request.body.projectId);}}
        else {response.render('error/Error');}
    });
});


module.exports=router;