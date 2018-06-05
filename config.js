module.exports = {


    liveDb : {
        host: 'localhost',
        user: 'root',
        pass:'',
        port:3306,
        database:'vondos',
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