var express = require ("express");
var requestData = require('request');
var app = express();
var router=express.Router();
var config=require('../../config');
var newPathAWS = require('../../aws-credientials.json');
var datetime = require('node-datetime');
var fs=require("fs");
var sizeOf = require('image-size');
var AWS = require('aws-sdk');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

router.get('/addListing',function (request,response) {
    // listing classes
    var url=config.server.host+':'+'/vondos/v1/api/listingselectdata/listingsclasses';
    requestData(url, function (error2, response2, body2) {
        if (!error2 && response2.statusCode == 200) {
            body2=JSON.parse(body2);
            var url=config.server.host+':'+'/vondos/v1/api/listingselectdata/properttypes';
            requestData(url, function (error3, response3, body3) {
                if (!error3 && response3.statusCode == 200) {
                    body3=JSON.parse(body3);
                    var url=config.server.host+':'+'/vondos/v1/api/listingselectdata/basementtypes';
                    requestData(url, function (error4, response4, body4) {
                        if (!error4 && response4.statusCode == 200) {
                            body4=JSON.parse(body4);
                            if(request.session.user) {
                                response.render("listing/add",{
                                    layout:false,
                                    session: request.session,
                                    listingtypes:body2,
                                    propertypes:body3,
                                    basementtypes:body4
                                });}}
                        else{response.render('error/Error');}
                    });}
                else{response.render('error/Error');}
            });}
        else{response.render('error/Error');}
    });
})


router.post('/addListing',function (request,response) {
    body.list_Date=convertToDate(body.List_Date);
    body.open_house=convertToDate(body.open_house);
    body.open_house2=convertToDate(body.open_house2);

    var datesCustom=[];
    datesCustom.push(body.list_Date);
    datesCustom.push(body.open_house)
    datesCustom.push(body.open_house2)
    request.body.newDates=datesCustom;

    var url=config.server.host+':'+'/vondos/v1/api/listing/listing/';
    requestData.post(url, {form:{data:request.body}},function (error,msg) {
        if (!error && msg.statusCode == 200) {
            if(msg.body=="-1") {
                response.render('error/Error');}
                else {response.redirect('/listing/list/1');}}
        else {response.render('error/Error');}
    });
});

router.get('/edit/:id?',function (request,response) {
    var id=request.params.id;
    var url=config.server.host+':'+'/vondos/v1/api/listing/listing/'+id;
    requestData(url, function (error, response1, body) {
        if (!error && response1.statusCode == 200) {
            body=JSON.parse(body);

            body.list_date=convertToDate(body.list_date);
            body.open_house=convertToDate(body.open_house);
            body.open_house2=convertToDate(body.open_house2);

           // listing classes
            var url=config.server.host+':'+'/vondos/v1/api/listingselectdata/listingsclasses';
            requestData(url, function (error2, response2, body2) {
                if (!error2 && response2.statusCode == 200) {
                    body2=JSON.parse(body2);
                   // basement type
                    var url=config.server.host+':'+'/vondos/v1/api/listingselectdata/properttypes';
                    requestData(url, function (error3, response3, body3) {
                        if (!error3 && response3.statusCode == 200) {
                            body3=JSON.parse(body3);
                            // Propert type
                            var url=config.server.host+':'+'/vondos/v1/api/listingselectdata/basementtypes';
                            requestData(url, function (error4, response4, body4) {
                                if (!error4 && response4.statusCode == 200) {
                                    body4=JSON.parse(body4);
                                    if(request.session.user) {
                                        response.render('listing/edit',{data:body,listingtypes:body2,propertypes:body3,basementtypes:body4});}}
                                else{response.render('error/Error');}
                            });}
                        else{response.render('error/Error');}
                    });}
                else{response.render('error/Error');}
            });}
        else{response.render('error/Error');}
    });
})


router.get('/photo/:id?',function (request,response) {
    id=request.params.id;
    var url=config.server.host+':'+'/vondos/v1/api/picture/picture/'+id;
    requestData(url, function (error1, projectResponse, body1) {
        if (!error1 && projectResponse.statusCode == 200) {
            body1=JSON.parse(body1);
            var url=config.server.host+':'+'/vondos/v1/api/listing/listing/'+id;
            requestData(url, function (error2, projectResponse2, body2) {
                if (!error2 && projectResponse2.statusCode == 200) {
                    if(body2!="") {body2=JSON.parse(body2);}
                    if(request.session.user) {
                        response.render('listing/photo',{data:body1,listingObject:body2});}}
                else{response.render('error/Error');}
            });
        }else{response.render('error/Error');}
    });
})


router.post('/photo',multipartMiddleware,function (request,response) {
    var newPathAWS='aws-credientials.json';
    AWS.config.loadFromPath(newPathAWS);
        var file = request.files.file;
    // sizeOf(file.path, function (err, dimensions) {
    //     if((dimensions.width==600&& dimensions.height==600)||(dimensions.width==600&& dimensions.height==1200))
    //     {
            fs.readFile(file.path, function (err, data) {
                if (err) throw err; // Something went wrong!
                var s3bucket = new AWS.S3({params: {Bucket: 'vondos'}});
                s3bucket.createBucket(function () {var params = {
                    Key: file.originalFilename, //file.name doesn't exist as a property
                    Body: data
                };

                    s3bucket.upload(params, function (err, data) {
                        fs.unlink(file.path, function (err){
                            if (err){console.error(err);}
                            console.log('Temp File Delete');
                        });
                        console.log("PRINT FILE:", file);
                        if(err){console.log('ERROR MSG: ', err);}
                        else{console.log('Successfully uploaded data');
                            var urlParams = {Bucket: 'vondos', Key: file.originalFilename};
                            s3bucket.getSignedUrl('getObject', urlParams, function(err, url1){
                                var url=config.server.host+':'+'/vondos/v1/api/picture/picture/';
                                requestData.post(url, {form:{url:url1,listingId:request.body.listingId}},function (error,msg) {
                                    if (!error && msg.statusCode == 200) {
                                        if(msg.body=="-1") {
                                            response.render('error/Error');}
                                        else {var a=request.body.listingId;
                                            response.redirect('/listing/photo/'+request.body.listingId+'?errorId=0');}}
                                    else {response.render('error/Error');}
                                });
                            })}
                    });
                });
            });
    //     }else{response.redirect('/listing/photo/'+request.body.listingId+'?errorId=1');}
    // });
})


router.get('/delete/:id?',function (request,response) {
    var listId=request.query.listId;
    var id=request.query.photoId;
    var url=config.server.host+':'+'/vondos/v1/api/picture/delete/'+id;
    requestData(url, function (error, response1, body) {
        if (!error && response1.statusCode == 200) {
            response.redirect('/listing/photo/'+listId);}
        else{response.render('error/Error');}
    });
})


router.get('/deletelisting/:id?',function (request,response) {
    var id=request.params.id;
    var url=config.server.host+':'+'/vondos/v1/api/listing/delete/'+id;
    requestData(url, function (error, response1, body) {
        if(!error && response1.statusCode == 200) {
            response.redirect('/listing/list/1');}
        else{response.render('error/Error');}
    });
})


router.post('/edit',function (request,response) {
    var url=config.server.host+':'+'/vondos/v1/api/listing/update/';
    requestData.post(url, {form:{data:request.body}},function (error,msg) {
        if (!error && msg.statusCode == 200) {
            if(msg.body=="-1"){
                response.render('error/Error');}
            else {response.redirect('/listing/list/1');}}
        else {response.render('error/Error');}
    });
});


router.get('/list/:id?',function (request,response) {
    var id=request.params.id;
    var url=config.server.host+':'+'/vondos/v1/api/listing/listing/';
    requestData(url, function (error, response1, body) {
        if(!error && response1.statusCode == 200) {
            body=JSON.parse(body);
            for(var i=0;i<body.length;i++){
                var d = new Date(body[i].list_date);
                var f=d.toDateString().substring(4);
                body[i].list_date=f;
            }
            if(id==1){
                if(request.session.user) {
                    response.render('listing/list',{data:body,success:1});}}
            else{if(request.session.user) {
                    response.render('listing/list',{data:body,success:0});}}}
        else{response.render('error/Error');}
    });
})


function convertToDate(date) {
    var datetoConvert = new Date(date);
    var cDate=datetoConvert.toDateString().substring(4);
    var sub=cDate.split(' ');
    cDate=sub[0]+' '+sub[1]+','+sub[2];
    return cDate;
}


module.exports=router;