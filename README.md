nodebb-plugin-import-ubb
========================

a UBB forum exporter to be required by [nodebb-plugin-import](https://github.com/akhoury/nodebb-plugin-import).

### What is this?

It's __just__ an exporter of [UBB Threads data](http://www.ubbcentral.com/),  that provides an API that [nodebb-plugin-import](https://github.com/akhoury/nodebb-plugin-import)
can use to exporter source forum data and import it to NodeBB's database. So, it's not really a conventional nodebb-plugin.

### Why is it even a NodeBB plugin?

it doesn't really need to be, nor that you can use it within NodeBB it self, but, having this as a plugin have few benefits:
* a nodebb- namespace, since you can't really use it for anything else
* it can easily `require` NodeBB useful tools, currently

### Usage within NodeJS only

```
// you don't have to do this, nodebb-plugin-import will require this plugin and use its api
// but if you want a run a test

var exporter = require('nodebb-plugin-import-ubb');

exporter.testrun({
    dbhost: '127.0.0.1',
    dbport: 3306,
    dbname: 'ubb',
    dbuser: 'user',
    dbpass: 'password',

    tablePrefix: 'ubbt_'
}, function(err, results) {

    /*
        results[0] > config
        results[1] > [usersMap, usersArray]
        results[2] > [categoriesMap, categoriesArray]
        results[3] > [topicsMap, topicsArray]
        results[4] > [postsMap, postsArray]
    */
});

```

### What does it export?
read carefully:

- ####Users:
    * `_username` YES. UBB for some reason allows duplicate users with same emails? so the first ones by ID orders will be saved, the rest will be skipped. (UBB appends [username]_dup[Number] next to the dups.. so those will be skipped too if the email is already used)
    * `_alternativeUsername` YES. as the __UBB.User.UserDisplayName__, which [nodebb-plugin-import](https://github.com/akhoury/nodebb-plugin-import) will try to use if the username validation fails
    * `_password` NO. UBB uses MD5, NodeBB uses base64 I think, so can't do, but if you use [nodebb-plugin-import](https://github.com/akhoury/nodebb-plugin-import) it will generate random passwords and hand them to you so can email them.
    * `_level` (administrator and moderator) YES. Admins will stay Admins, and Moderators will stay Moderators, the catch here though is that each moderator is a moderator on ALL of the categories
    * `_joindate` YES, UBB uses Seconds, the exported will convert to Milliseconds
    * `_website` YES. if URL looks valid, it is exported, but it's not checked if 404s
    * `_picture` YES. if URL looks valid, it is exported, but it's not checked if 404s, if not valid, it's set to "" and NodeBB will generate a gravatar URl for the user
    * `_reputation` SORT-OF. assumed as the __UBB.User.raking__
    * `_profileviews` SORT-OF. assumed as the __UBB.User.totalRanks__ I didn't find anything closer
    * `_location` YES. migrated as is, clear text
    * `_signature` YES. migrated as is (HTML -- read the [Markdown note](#markdown-note) below)
    * `_banned` YES. it will stay banned, by username
    * __Oh and__ UBB have a weird User with ID == 1, ******DONOTDELETE****** <= that's like the first user created, and somehow, in my UBB installation, it does own few topics and posts, this one will not be migrated, BUT [nodebb-plugin-import](https://github.com/akhoury/nodebb-plugin-import) will assigned these post to the to the NodeBB initial Admin created.


- ####Categories (AKA Forums per UBB Speak):
    * `_name` YES
    * `_description` YES

- ####Topics:
    * `_cid` __(or its UBB category aka Forum id)__ YES (but if its parent Category is skipped, this topic gets skipped)
    * `_uid` __(or its UBB user id)__ YES (but if its user is skipped, this topic gets skipped)
    * `_title` YES
    * `_content` __(or the 'parent-post` content of this topic)__ YES (HTML - read the [Markdown Note](#markdown-note) below)
    * `_timestamp` YES, UBB uses Seconds, the exporter will convert to Milliseconds
    * `_pinned` YES (0 or 1) (I don't know how many you can pin in NodeBB)
    * `_viewcount` YES

- ####Posts:
    * `_pid` __(or its UBB post id)__
    * `_tid` __(or its UBB parent topic id)__ YES (but if its parent topic is skipped, this post gets skipped)
    * `_uid` __(or its UBB user id)__ YES (but if its user is skipped, this post is skipped)
    * `_content` YES (HTML - read the [Markdown Note](#markdown-note) below)
    * `_timestamp` YES, UBB uses Seconds, the exporter will convert to Milliseconds

### UBB Versions tested on:
  - UBB 7.5.7

### Markdown note

read [nodebb-plugin-import#markdown-note](https://github.com/akhoury/nodebb-plugin-import#markdown-note)

### It's an exporter, why does it have 'import' in its title

To keep the namespacing accurate, this __exporter__ is designed to export data for [nodebb-plugin-import](https://github.com/akhoury/nodebb-plugin-import) only, also for a 1 time use, so why do you care.

