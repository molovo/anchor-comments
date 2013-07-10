jQuery(document).ready(function($) {
	$('section.content article > p').each(function(i) {
		i = i+1;
		$(this).css({position: 'relative'}).prepend('<a href="' + i + '" class="anchor-comment-link">+</a><div class="anchor-comment" data-position="' + i + '"><form class="comment" action="' + base + 'addinlinecomment/' + slug + '" method="post"><h3>Leave a Comment</h3><label for="name">Name</label><input type="text" name="name"><label for="email">Email</label><input type="email" name="email"><blockquote class="anchor-comment-quote"></blockquote><input type="hidden" name="quote" /><label for="text">Comment</label><textarea name="text"></textarea><input type="hidden" name="pos" value="' + i + '" /><button type="submit" value="submit">Post Comment</button></form></div>');

		$.getJSON(base + 'comments/' + slug + '/' + i, function(response) {
			if (response[0]) {
				$('.anchor-comment-link[href="' + i + '"]').addClass('has-comments').html('<small>' + response.length + '</small>');
				var items = '<ul class="commentlist">' + '<h3>Comments</h3>';

				$.each(response, function(row, data) {
					data = data['data'];
					items += '<li>';
					$.each(data, function(key, val) {

						if (key == 'name') {
							items += '<h4>' + val + '</h4>';
						}
						if (key == 'quote' && val) {
							items += '<blockquote class="anchor-comment-quote-display">&ldquo;' + val + '&rdquo;</blockquote>';
						}
						if (key == 'text') {
							items += '<p>' + val + '</p>';
						}
					});
					items += '</li>';
				});

				items += '<li><p><a href="#' + i + '" class="anchor-comment-add" onclick="javascript:showCommentForm(' + i + ');">Add a Comment</a></p></li></ul>';

				$('.anchor-comment[data-position="' + i + '"]').prepend(items);
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
				var count = parseInt($('.anchor-comment[data-position="' + data['pos'] + '"] .anchor-comment-link small').html());
				if (count) {
					$('.anchor-comment[data-position="' + data['pos'] + '"] .commentlist').append('<li><h4>' + data['name'] + '</h3><p>' + data['text'] + '</p></li>');
				} else {
					count = 0;
					$('.anchor-comment[data-position="' + data['pos'] + '"]').prepend('<ul class="commentlist"><h3>Comments</h3></ul>');
					$('.anchor-comment[data-position="' + data['pos'] + '"] .commentlist').append('<li><h4>' + data['name'] + '</h4><p>' + data['text'] + '</p></li>');
				}
				$('.anchor-comment-link[href="' + data['pos'] + '"]').html('<small>' + (count + 1) + '</small>').addClass('has-comments');
				$('.anchor-comment[data-position="' + data['pos'] + '"] form.comment').fadeOut(300);
				$('.anchor-comment[data-position="' + data['pos'] + '"] .commentlist').fadeIn(300);
			}
		});
		return false;
	})

	$('.anchor-comment-link').on('click', function() {
		var act = $(this).attr('href');
		var close = false;

		$('.anchor-comment[data-position="' + act + '"]').find('.commentlist, form.comment').each(function() {
			if ($(this).is(':visible')) {
				$(this).fadeOut(300);
				$('.anchor-comment-link[href="' + act + '"]').removeClass('active');
				$('section.content').removeClass('anchor-comments-visible');
				close = true;
			}
		});

		if (!close) {
			$('.anchor-comment').find('.commentlist, form.comment').fadeOut(300);
			$('section.content').removeClass('anchor-comments-visible');
			$('.anchor-comment-link').removeClass('active');

			if ($(this).hasClass('has-comments')) {
				$(this).toggleClass('active');
				$('.anchor-comment[data-position="' + act + '"] .commentlist').fadeToggle(300);
				$('section.content').toggleClass('anchor-comments-visible');
			} else {
				$(this).toggleClass('active');
				$('.anchor-comment[data-position="' + act + '"] form.comment').fadeToggle(300);
				$('section.content').toggleClass('anchor-comments-visible');
			}
		}
		return false;
	});
});

function showCommentForm(act) {
	$('.anchor-comment[data-position="' + act + '"] .commentlist').fadeOut(300);
	$('.anchor-comment[data-position="' + act + '"] form.comment').fadeIn(300);
	return false;
}

if(!window.anchorComment){
	anchorComment = {};
}

anchorComment.Selector = {};
anchorComment.Selector.getSelected = function(){
  var t = '';
  if(window.getSelection){
    t = window.getSelection();
  }else if(document.getSelection){
    t = document.getSelection();
  }else if(document.selection){
    t = document.selection.createRange().innerHTML;
  }
  return t;
}

$('section.content').mouseup(function(e){
	var tooltip = $('#commentQuoteTooltip');
    mousePos = {left: e.pageX - tooltip.width(), top: e.pageY - (tooltip.height() * 2) + $(window).scrollTop()};
	var st = anchorComment.Selector.getSelected();
	var stp = $('section.content').find(':not(:has(:contains("' + st + '"))):contains("' + st + '")');

	if(st!='' && stp.html().match(st) && (!$('body').data('st') || $('body').data('st') != st)) {
		$('body').data('st', st);
		var pos = stp.find('.anchor-comment').attr('data-position');
		tooltip.offset(mousePos).fadeIn(300);

		$('#commentQuoteTooltip').click(function() {
			$('.anchor-comment-quote').each(function() {
				$(this).empty();
			});
			$('.anchor-comment').find('.commentlist, form.comment').fadeOut(300);
			$('section.content').removeClass('anchor-comments-visible');
			$('.anchor-comment-link').removeClass('active');

			$('.anchor-comment-link[href="' + pos + '"]').toggleClass('active');
			$('.anchor-comment[data-position="' + pos + '"] form.comment').fadeToggle(300);
			$('.anchor-comment[data-position="' + pos + '"] input[name="quote"]').val(st);
			$('.anchor-comment[data-position="' + pos + '"] .anchor-comment-quote').html($('.anchor-comment[data-position="' + pos + '"] input[name="quote"]').val());
			$('section.content').toggleClass('anchor-comments-visible');

			$(this).fadeOut(300).offset({left: 0, top: 0});
			return false;
		});
	} else if (st == '') {
		$('body').data('st', '');
		$('#commentQuoteTooltip').fadeOut(300).offset({left: 0, top: 0});
	}
});