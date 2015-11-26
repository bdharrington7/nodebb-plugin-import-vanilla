nodebb-plugin-import-vanilla
========================

A Vanilla forum exporter to be required by [nodebb-plugin-import](https://github.com/akhoury/nodebb-plugin-import).

### What is this?

It's __just__ an exporter of [Vanilla Forums data](http://www.vanillaforums.org/),  that provides an API that [nodebb-plugin-import](https://github.com/akhoury/nodebb-plugin-import)
can use to exporter source forum data and import it to NodeBB's database. So, it's not really a conventional nodebb-plugin.

### Why is it even a NodeBB plugin?

it doesn't really need to be, nor that you can use it within NodeBB it self, but, having this as a plugin have few benefits:
* a nodebb- namespace, since you can't really use it for anything else
* it can easily `require` NodeBB useful tools, currently

### Usage within NodeJS only

```
// you don't have to do this, nodebb-plugin-import will require this plugin and use its api
// but if you want a run a test

var exporter = require('nodebb-plugin-import-vanilla');

exporter.testrun({
    dbhost: '127.0.0.1',
    dbport: 3306,
    dbname: 'vanilla',
    dbuser: 'user',
    dbpass: 'password',

    tablePrefix: 'GDN_'
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
Read carefully:

- ####Users:
    * `_username` YES.
    * `_alternativeUsername` NO. There's no equivalent in Vanilla
    * `_password` MAYBE. Vanilla uses bcrypt, unless it's been migrated from another platform. NodeBB uses multi-pass bcrypt, so if you know Vanilla was using bcrypt and you set nodebb's encryption rounds to the same number, you might get the same hash. If you use [nodebb-plugin-import](https://github.com/akhoury/nodebb-plugin-import) it will generate random passwords and hand them to you so you can email them.
    * `_level` (administrator and moderator) SORT OF. Admins will stay Admins.
    * `_joindate` YES.
    * `_website` NO. There's no equivalent in Vanilla
    * `_picture` YES. You have to move or copy the (entire, not just the contents) `<Vanilla Root>/uploads/userpics` folder to the `NodeBB/public/uploads` folder.
    * `_reputation` YES, if you had the Kudos plugin installed on Vanilla. You'd have to set the custom option: "kudosEnabled" to true: `{ "kudosEnabled": true }`
        * Note that `reputation` is a function of `upvotes - downvotes`, so you will get the kudos attached to the posts as upvotes and downvotes
        * Also note that there's a setting in NodeBB that prevents users from casting a downvote if they don't have a certain threshold of reputation. Make sure that setting is off or set to 0.
    * `_profileviews` NO. There's no equivalent in Vanilla
    * `_location` NO. There's no equivalent in Vanilla
    * `_signature` NO. There's no equivalent in Vanilla
    * `_banned` NO. I haven't used this feature in Vanilla so I don't know what the data looks like.


- ####Categories:
    * `_name` YES
    * `_description` YES

- ####Topics:
    * `_cid` YES (but if its parent Category is skipped, this topic gets skipped)
    * `_uid` __(or its Vanilla user id)__ YES (but if its user is skipped, this topic gets skipped)
    * `_title` YES
    * `_content` __(or the 'parent-post` content of this topic)__ YES (HTML - read the [Markdown Note](#markdown-note) below)
    * `_timestamp` YES
    * `_pinned` YES (0 or 1) (I don't know how many you can pin in NodeBB)
    * `_viewcount` YES

- ####Posts:
    * `_pid` __(or its Vanilla post id)__
    * `_tid` __(or its Vanilla parent topic id)__ YES (but if its parent topic is skipped, this post gets skipped)
    * `_uid` __(or its Vanilla user id)__ YES (but if its user is skipped, this post is skipped)
    * `_content` YES (HTML - read the [Markdown Note](#markdown-note) below)
    * `_timestamp` YES

- ####Votes:
    * You can import votes on posts, if you had the Kudos plugin installed on Vanilla. You'd have to set the custom option: "kudosEnabled" to true: `{ "kudosEnabled": true }`

- ####Bookmarks:
   * The place you left off in a topic is preserved
   * TODO: the place you left off in a topic indicates if that topic is unread for you or not

### Known issues:
* Not Migrated:
** Subscriptions / watched topics
** Chats / messages between users
** bans
** attachments
** permissions
** roles
** tags

### Vanilla Versions tested on:
  - Vanilla 2.1.8p2

### Markdown note

read [nodebb-plugin-import#markdown-note](https://github.com/akhoury/nodebb-plugin-import#markdown-note)

### It's an exporter, why does it have 'import' in its title

To keep the namespacing accurate, this __exporter__ is designed to export data for [nodebb-plugin-import](https://github.com/akhoury/nodebb-plugin-import) only, also for a 1 time use, so why do you care.
