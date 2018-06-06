module.exports = {

    liveDb : {
        host: 'us-cdbr-iron-east-04.cleardb.net',
        user: 'bdb2760963848d',
        pass:'cf5e5d7a',
        port:3306,
        database:'heroku_bfc93574a934697',
        dialect:'mysql',
        pool:{
            min:0,
            max:5,
            idle:10000
        }
    },

    server : {
        host:'https://api-3322.herokuapp.com'
    },
    dirPath : {
        model:'../models',

    },
    app:{
        port:3322
    }

};