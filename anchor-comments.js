jQuery(document).ready(function($) {
	$('.anchor-comment form.comment').hide();
	$('section.content article p').each(function(i) {
		$(this).css({position: 'relative'}).prepend('<div class="anchor-comment" data-position="' + i + '"><span class="comment-count"></span><a href="' + i + '" class="anchor-comment-link">+</a><h3 class="commentlist">Be the first to comment</h3><form class="comment" action="' + base + 'addinlinecomment/' + slug + '" method="post"><h3>Leave a Comment</h3><label for="name">Name</label><input type="text" name="name"><label for="email">Email</label><input type="email" name="email"><label for="text">Comment</label><textarea name="text"></textarea><input type="hidden" name="pos" value="' + i + '" /><button type="submit" value="submit">Post Comment</button></form></div>');

		$.getJSON(base + 'comments/' + slug + '/' + i, function(response) {
			if (response[0]) {
				$('.anchor-comment[data-position="' + i + '"]').addClass('has-comments');
				$('.anchor-comment[data-position="' + i + '"] span.comment-count').html(response.length);
				$('.anchor-comment[data-position="' + i + '"] h3.commentlist').remove();
				var items = '<ul class="commentlist">' + '<h3>Comments</h3>';

				$.each(response, function(row, data) {
					data = data['data'];
					items += '<li>';
					$.each(data, function(key, val) {

						if (key == 'name') {
							items += '<h4>' + val + '</h4>';
						}
						if (key == 'text') {
							items += '<p>' + val + '</p>';
						}
					});
					items += '</li>';
				});

				items += '</ul>';

				$('.anchor-comment[data-position="' + i + '"] .anchor-comment-link').after(items);
			}
		});
	});

	$('.anchor-comment form.comment').on('submit', function() {
		var action = $(this).attr('action');
		var data = {};
		$(this).find('input, textarea').each(function() {
			var field = $(this).attr('name');
			var value = $(this).val();
			data[field] = value;
		});

		$.post(action, data, function(response) {
			if (response == 'success') {
				var count = parseInt($('.anchor-comment[data-position="' + data['pos'] + '"] span.comment-count').html());
				if (count) {
					$('.anchor-comment[data-position="' + data['pos'] + '"] ul.commentlist').append('<li><h4>' + data['name'] + '</h3><p>' + data['text'] + '</p></li>');
				} else {
					count = 0;
					$('.anchor-comment[data-position="' + data['pos'] + '"] h3.commentlist').remove();
					$('.anchor-comment[data-position="' + data['pos'] + '"] .anchor-comment-link').after('<ul class="commentlist"><h3>Comments</h3>');
					$('.anchor-comment[data-position="' + data['pos'] + '"] ul.commentlist').append('<li><h4>' + data['name'] + '</h3><p>' + data['text'] + '</p></li>');
				}
				$('.anchor-comment[data-position="' + data['pos'] + '"] span.comment-count').html(count + 1);
				$('.anchor-comment[data-position="' + data['pos'] + '"] form.comment').fadeOut(300);
				$('.anchor-comment[data-position="' + data['pos'] + '"] .commentlist').fadeIn(300);
				setTimeout(function() {
					$('.anchor-comment[data-position="' + data['pos'] + '"] .commentlist').fadeOut(300);
					$('.anchor-comment[data-position="' + data['pos'] + '"]').removeClass('typing');
				}, 2000);
			}
		});
		return false;
	})

	$('.anchor-comment').on('mouseenter', function() {
		var act = $(this).attr('data-position');
		$('.anchor-comment[data-position="' + act + '"]').not('.typing').find('.commentlist').fadeIn(300);
	}).on('mouseleave', function() {
		var act = $(this).attr('data-position');
		$('.anchor-comment[data-position="' + act + '"]').not('.typing').find('form.comment').fadeOut(300);
		$('.anchor-comment[data-position="' + act + '"]').find('.commentlist').fadeOut(300);
	});

	$('.anchor-comment-link').on('click', function() {
		var act = $(this).attr('href');
		$('.anchor-comment').removeClass('typing').find('.commentlist, form.comment').fadeOut(300);
		$('.anchor-comment[data-position="' + act + '"]').addClass('typing');
		$('.anchor-comment[data-position="' + act + '"] .commentlist').fadeOut(300);
		setTimeout(function() {
			$('.anchor-comment[data-position="' + act + '"] form.comment').fadeIn(300).find('input:first').focus();
		}, 300);
		return false;
	});
});