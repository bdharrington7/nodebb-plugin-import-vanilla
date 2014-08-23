var fs = require('fs-extra');

require('./index').testrun({
    dbhost: 'localhost',
    dbport: 3306,
    dbname: 'ubb_db',
    dbuser: 'user',
    dbpass: 'password',

    tablePrefix: 'ubbt_'
}, function(err, results) {
    // fs.writeFileSync('./results.json', JSON.stringify(results, undefined, 2));
});