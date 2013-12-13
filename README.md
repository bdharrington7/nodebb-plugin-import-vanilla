nodebb-plugin-import-ubb
========================

a UBB forum exporter to import-ready files.

a refactor of [nodebb-plugin-ubbmigrator](https://github.com/akhoury/nodebb-plugin-ubbmigrator)
into this plugin to work along with [nodebb-plugin-import](https://github.com/akhoury/nodebb-plugin-import).

__works, but still young__

### What is this?

It's __just__ an exporter of [UBB Threads data](http://www.ubbcentral.com/), into files that [nodebb-plugin-import](https://github.com/akhoury/nodebb-plugin-import) can understand
and import to NodeBB's database. So, it's not really a conventional nodebb-plugin, and you have to run it from the command line.

### Why is it even a NodeBB plugin?

it doesn't really need to be, nor that you can use it within NodeBB it self, but, having this as a plugin have few benefits:
* a nodebb- namespace, since you can't really use it for anything else
* it can easily `require` NodeBB useful tools, currently, it uses its [util.js](https://github.com/designcreateplay/NodeBB/blob/master/public/src/utils.js) for example.
* potentially, in the future, this plugin, __nodebb-plugin-import-ubb__ can interact with [nodebb-plugin-import](https://github.com/akhoury/nodebb-plugin-import) for a better UX

### Usage

```
cd NodeBB
npm install nodebb-plugin-import-ubb
cd node_modules/nodebb-plugin-import-ubb/bin
node export.js --storage="$HOME/Desktop/storage" --config="../export.config.json" --log="debug,info,warn" --flush
```

### What does it export?
read carefully:

- ####Users:
    * `_username` YES. UBB for some reason allows duplicate users with same emails? so the first ones by ID orders will be saved, the rest will be skipped. (UBB appends [username]_dup[Number] next to the dups.. so those will be skipped too if the email is already used)
    * `_alternativeUsername` YES. as the __UBB.User.UserDisplayName__, which [nodebb-plugin-import](https://github.com/akhoury/nodebb-plugin-import) will try to use if the username validation fails
    * `_password` NO. UBB uses MD5, NodeBB uses base64 I think, so can't do, but if you use [nodebb-plugin-import](https://github.com/akhoury/nodebb-plugin-import) it will generate random passwords and hand them to you so can email them.
    * `_level` (administrator and moderator) YES. Admins will stay Admins, and Moderators will stay Moderators, the catch here though is that each moderator is a moderator on ALL of the categories, since I didn't find anywhere UBB separating these powers. Hopefully soon you will be able to edit the Moderators easily via the NodeBB/admin.
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

### I exported, now what?

now use this [nodebb-plugin-import](https://github.com/akhoury/nodebb-plugin-import) to import your files into NodeBB's database

### Versions tested on:
  - UBB 7.5.7

### You configs are required

But you can override the log, storageDir and clearStorage ones with flags when using [bin/export.js](bin/export.js)
```
{
	"log": "debug",
	"storageDir": "../storage",

	"clearStorage": false,

	"db": {
		"host": "localhost",
		"user": "ubb_user",
		"password": "password",
		"database": "ubb_test"
	},
	"tablePrefix": "ubbt_"

}
```

### Markdown note

read [nodebb-plugin-import#markdown-note](https://github.com/akhoury/nodebb-plugin-import#markdown-note)

### It's an exporter, why does it have 'import' in its title

To keep the namespacing accurate, this __exporter__ is designed to export data for [nodebb-plugin-import](https://github.com/akhoury/nodebb-plugin-import) only, also for a 1 time use, so why do you care.

