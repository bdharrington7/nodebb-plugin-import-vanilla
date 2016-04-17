nodebb-plugin-import-vanilla
========================

A Vanilla forum exporter to be required by [nodebb-plugin-import](https://github.com/akhoury/nodebb-plugin-import).

### Changelog
* 0.2.0: Updating to work with nodebb-plugin-import > 0.3.41 (for NBB version == 1.0.0)
* 0.0.1: Inital framework

### What is this?

It's __just__ an exporter of [Vanilla Forums data](http://www.vanillaforums.org/),  that provides an API that [nodebb-plugin-import](https://github.com/akhoury/nodebb-plugin-import)
can use to exporter source forum data and import it to NodeBB's database. So, it's not really a conventional nodebb-plugin.

### Why is it even a NodeBB plugin?

It doesn't really need to be, nor that you can use it within NodeBB itself, but, having this as a plugin have few benefits:
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
    * `_picture` YES. You have to move or copy the (entire, not just the contents) `<Vanilla Root>/uploads/userpics` folder into the `NodeBB/public/uploads` folder.
    * `_reputation` YES, if you had the Kudos plugin installed on Vanilla. You'd have to set the custom option: "importKudos" to true: `{ "importKudos": true }`
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
    * You can import votes on posts, if you had the Kudos plugin installed on Vanilla. 
    * Enable with `{ "importKudos": true }`

- ####Bookmarks:
   * The place each user left off in a topic is preserved
   * Enable with `{ "importBookmarks": true }`

- ####Attachments:
   * Move or copy the whole `<Vanilla Root>/uploads/FileUpload` folder into the `NodeBB/public/uploads` folder.
   * Assumes you have the [Media Attachments]() plugin installed for uploads
   * Grabs records from the GDN_Media table to get the file paths of your attachments on the file system

### Known issues:
* Not Migrated:
    * Subscriptions / watched topics
    * Multi-user bans (simple user-based banning is imported, but I haven't been able to test it)
    * permissions
    * roles
    * tags

### Vanilla Versions tested on:
  - Vanilla 2.1.8p2

### Custom plugins note:
##### This importer enables importing data from custom vanilla plugins:
  * [kudos]()
    * Import these with the option `{ "importKudos": true }`
  * [Media upload]()
    * Migrate these into embedded images (for image files), and links (for all other files) with this custom attibute: `{ "importAttachments": true}`
    * With this plugin, users can have the Canonical link inserted into the post after upload, which breaks things if you are migrating to a new domain name. You can use this javascript snippet in the pre-process section of the Post-import tools utility to remove those duplicated, or broken links:
    ```
    content = content.replace(/<.*?your\.domain\.com.*?\/>/g, '')
    ```
  * [Spoilers]()
##### Other custom transformations
  * Quoting
    * Quotes in vanilla use the tag `<blockquote rel="author">` to denote quoted text and the original author. Since "rel" isn't a standard attribute in HTML, the library being used to convert HTML to markdown won't recognize the author properly. As a workaround, you can use this javascript to transform the Vanilla quote blocks to BBCode style tags, with the proper attribute that can be converted back to HTML, and then to markdown:
    ```
    content = content.replace(/<blockquote rel=([^>]+)>/g, '[quote author=$1]').replace(/<\/blockquote>/g, '[/quote]')
    ```


### Markdown note

read [nodebb-plugin-import#markdown-note](https://github.com/akhoury/nodebb-plugin-import#markdown-note)

### It's an exporter, why does it have 'import' in its title

To keep the namespacing accurate, this __exporter__ is designed to export data for [nodebb-plugin-import](https://github.com/akhoury/nodebb-plugin-import) only, also for a 1 time use.
