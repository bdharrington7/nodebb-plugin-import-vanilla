var fs = require('fs-extra');

require('./index').testrun({
    dbhost: 'localhost',
    dbport: 3306,
    dbname: 'vanilla',
    dbuser: 'user',
    dbpass: 'password',

    tablePrefix: 'GDN_'
}, function(err, results) {
    // fs.writeFileSync('./results.json', JSON.stringify(results, undefined, 2));
});
