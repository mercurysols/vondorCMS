module.exports = {


    liveDb : {
        host: 'us-cdbr-iron-east-04.cleardb.net',
        user: 'b1466f0b4aad25',
        pass:'0bdc5aef',
        port:3306,
        database:'heroku_22fdd806fc12bbe',
        dialect:'mysql',
        pool:{
            min:0,
            max:5,
            idle:10000
        }
    },

    server : {
        host:'http://127.0.0.1',
        port : 1234
    },
    dirPath : {
        model:'../models',

    },
    app:{
        port:3322
    }

};