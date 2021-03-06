anchor-comments
===============

A plugin utilising the existing Anchor CMS comments functionality to provide inline comments within articles.

Check out a rough demo [ here](http://molovo.co.uk/blog/comment-testing)

NOTE:: *This plugin is __very much still in development__, so please test thoroughly and shout at me if it's broken so I can fix it :)*

### Setup

##### Place the plugin within your theme
Place the files within a subfolder in the base directory of your theme. `e.g. /themes/default/anchor-comments`


##### Setup the Comment URLs
Add the following to `/anchor/routes/site.php` anywhere between lines `19` and `241`.

```php
Route::get('comments/(:any)/(:num)', function($slug, $pos) {
	$table = Base::table('comments');
	$column1 = 'pos';
	$column2 = 'quote';

	$sql = 'SHOW COLUMNS FROM `' . $table . '`';
	list($result, $statement) = DB::ask($sql);
	$statement->setFetchMode(PDO::FETCH_OBJ);

	$columns = array();

	foreach($statement->fetchAll() as $row) {
		$columns[] = $row->Field;
	}

	$has_column1 = in_array($column1, $columns);
	$has_column2 = in_array($column2, $columns);

	if(!$has_column1) {
		$sql = "ALTER TABLE `" . $table . "` ADD `pos` INT NULL";
		DB::ask($sql);
	}

	if(!$has_column2) {
		$sql = "ALTER TABLE `" . $table . "` ADD `quote` VARCHAR(2500) NULL AFTER `email`";
		DB::ask($sql);
	}

	$json = Json::encode(
		Comment::where('status', '=', 'approved')->where('post', '=', Post::slug($slug)->id)->where('pos', '=', $pos)->get()
	);

	return Response::create($json, 200, array('content-type' => 'application/json'));
});

Route::post('addinlinecomment/(:any)', function($slug) {
	$input = Input::get(array('name', 'email', 'text', 'pos', 'quote'));

	$validator = new Validator($input);

	$rtn = array();

	if ($validator->check('email')) {
		$rtn['email'] = 'invalid';
	}

	if ($validator->check('text')) {
		$rtn['message'] = 'empty';
	}

	if($errors = $validator->errors()) {
		return $rtn;
	}

	$input['post'] = Post::slug($slug)->id;
	$input['date'] = Date::mysql('now');
	$input['status'] = Config::meta('auto_published_comments') ? 'approved' : 'pending';

	// remove bad tags
	$input['text'] = strip_tags($input['text'], '<a>,<b>,<blockquote>,<code>,<em>,<i>,<p>,<pre>');

	// check if the comment is possibly spam
	if($spam = Comment::spam($input)) {
		$input['status'] = 'spam';
	}

	$comment = Comment::create($input);

	return 'success';
});
```


##### Launch the plugin

Place this code at the bottom of `article.php` within your theme.

```php
<?php if (comments_open()): ?>
    <script src="http://code.jquery.com/jquery-1.10.0.min.js"></script>
    <?php theme_include('anchor-comments/anchor-comments'); ?>
<?php endif; ?>
```
<small>If you have chosen a different directory, then reflect this in the include above.</small>

<small>If you have already loaded jQuery within your theme then that line can be omitted.</small>

##### Additional Info

* This plugin uses the existing comment functionality, so comments can be disabled/enabled per article, approved and marked as spam within the admin console, and set to be auto approved, just as with the standard comment system.
* The default styling for the plugin matches the default theme, and works best at desktop sizes (The comments will be present at mobile sizes on responsive sites, but may appear of screen). A responsive version is in the works.
* If an additional paragraph is added after comments have been posted, all comments from that paragraph to the end of the article will appear one paragraph early (and earlier if more than one is added). There's no easy way around this without some serious data modification, but I'll find a way eventually.