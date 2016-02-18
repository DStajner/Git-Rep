
var app = {

	html : null,
	langs : {
	
		en: 'English',
		zh: 'Chinese',
		ja: 'Japanese',
		ko: 'Korean',
		es: 'Spanish',
		pt: 'Portuguese',
		de: 'German',
		pl: 'Polish',
		ru: 'Russian',
		fr: 'French',
		it: 'Italian',
		sv: 'Sweddish',
		no: 'Norweiagan',
		da: 'Danish',
		nl: 'Dutch',
		fi: 'Finnish',
		tr: 'Turkish',
		cs: 'Czecs',
		sk: 'Slovak',
		hu: 'Hungarian'
	},

	events: function() {
		var $body = $('body');
		$('.menu-toggle').bind('click', function() {
			$body.toggleClass('menu-open');
			if ( !$body.hasClass('menu-open') ) {
				console.log('go filter!');
				app.filterByLanguage();
			}
			return false;
		});

		$('.menu-toggle-right').bind('click', function() {
			$body.toggleClass('menu-open-right');
			return false;
		});

		$( "#openclose" ).click(function() {
			$( ".menu-toggle" ).toggleClass( "menu-toggle-close", 1000 );
		});

		$( "#openclose-right" ).click(function() {
			$( ".menu-toggle-right" ).toggleClass( "menu-toggle-right-close", 1000 );
		});

		var noOverlay = $('.no-overlay');
		$('#openclose').bind('click', function() {
			noOverlay.toggleClass('overlay', 2000);
			return false;
		});

		var noOverlayRight = $('.no-overlay');
		$('#openclose-right').bind('click', function() {
			noOverlayRight.toggleClass('overlay');
			return false;
		});

		$('.menu-side-right').on('click', '.game-picker a', function(e){
			e.preventDefault();
			var game = $(this).html();
			console.log($(this).html());
			app.getData('game', game);
			$body.toggleClass('menu-open-right');
		});

		$('#container').on('click', '.stream-box-inner', function(e){
			var channel = $(this).data('name');
			console.log('show stream! ' + channel);
			$('#video-pop iframe').attr('src', 'http://player.twitch.tv/?channel=' + channel);
			$('#video-pop').show();
		});

		$('#video-pop').on('click', '.close-video', function(e){
			e.preventDefault();
			$('#video-pop iframe').attr('src', '');
			$('#video-pop').hide();
		});
	},

	//render: function ( data, whatTemplate, where, how ) 
	render: function ( data, templateId, where, method ) {


		var $el = $(templateId);

		var temp = $el.html();

		var render = Handlebars.compile(temp);
		
		var html = render(data);

		switch (method)
		{
			case "clean":
				$(where)
					.empty()
					.append(html);
					break;
			case "append":
				$(where)
					.append(html);
					break;
			case "prepend":
				$(where)
					.prepend(html);
					break;
			case 'html':
				return html;
			default:
			console.log("wrong or no case method from called function");
		}
	},

	init: function() {
		app.events();
		app.getData(null, null);

	},
	show: function(streams, games, languages, filter, by) {
		app.render(streams,"#streams","#container", "clean");
		if ( !filter ) {
			app.render(games,"#games",".menu-side-right", "clean");
			app.render(languages,"#languages",".menu-side", "clean");
		}
	},
	getData: function(filter, by) {
		var games = [],
			languages = [];
		$.get( "https://api.twitch.tv/kraken/streams", function( data ) {
			console.log('done!', data);
			var chanells = data.streams,
				filtered = [],
				newLang,
				fullLang;
			chanells.forEach( function(stream) {
				stream.created_at = app.getDateFormat(stream.created_at);
				fullLang = app.langs[stream.channel.language] || stream.channel.language;
				// get all games names
				if ( games.indexOf(stream.game) === -1 && stream.game ) {
					games.push(stream.game);
				}
				// get all games languages
				newLang = true;
				languages.forEach( function(lang) {
					if (!lang) {return ;}
					if ( lang.langShort === stream.channel.language ) {
						newLang = false;
					}
				});
				if (newLang === true) {
					languages.push({
						langShort: stream.channel.language,
						langLong: fullLang
					});
				}
				// check for game filter
				if ( filter === 'game' && stream.game === by ) {
					filtered.push( stream );
				}
				// check for language filter
				else if ( filter === 'lang' && by.indexOf(stream.channel.language) != -1 ) {
					filtered.push( stream );
				}
			});
			if ( filter ) {
				chanells = filtered;
			}
			console.log('games:', games);
			console.log('languages:', languages);
			console.log('filterGame:', filtered);
			app.show( chanells, games, languages, filter, by );
		});
	},
	filterByLanguage: function() {
		langsSelected = [];
		$('.menu-side input:checked').each(function(i, item) {
			langsSelected.push(item.id);
		});
		console.log(langsSelected);
		if ( langsSelected.length ) {
			app.getData('lang', langsSelected);
		}
	},
	getDateFormat: function(dateString) {
		var date = new Date(dateString).toDateString().slice(4).split(' ');
		return date[0] + ' ' + date[1] +', ' + date[2];
	}
};

app.init();