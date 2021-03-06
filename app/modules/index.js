

define([
	"zeega",
	// Libs
	"backbone",
	// Plugins
	'zeega_player',

	"modules/featured-intro",

	// Submodules.
	'modules/submodules/loadingspinner'
],

function(Zeega, Backbone,Player,FeaturedIntro,loadingSpinner) {


	// Create a new module
	var Index = Zeega.module();

	Index.Model = Backbone.Model.extend({

		initialize : function()
		{
			Zeega.featureLoading=true;
			loadingSpinner.show('Takeout');
			var _this = this;
			this.project = new Project();
			this.project.id = this.get('featuredID');
			this.project.fetch().success(function(){
				// I should not have to put this in Zeega.player!
				// want this in _this.player !!

				Zeega.player = new Zeega.Player( _this.project.toJSON() );
				_this.player = Zeega.player; // I want to remove this
			//	_this.player.on('ready', _this.renderCitation, _this);
				_this.player.init();
				console.log('feature', _this );

				$(window).unbind('project_loaded').bind('project_loaded',function(){
			
					loadingSpinner.hide();
					if(Zeega.initialLoader){
						Zeega.player.pause();
						Zeega.featureLoading=false;
					}
					else{
						$(window).unbind('project_loaded');
						Zeega.player.play();
						this.featuredIntro = new FeaturedIntro.View();
						this.featuredIntro.takeoutName = Zeega.player.get('title');
						$('body').append(this.featuredIntro.el);
						this.featuredIntro.render();
						var fIntro = this.featuredIntro;
						_.delay(function(){
							fIntro.$('.featured-intro-overlay').fadeOut(2000, function(){
								fIntro.remove();
							});
						}, 4000);
						
					}
					
				});



			});
		},

		renderCitation : function()
		{
			loadingSpinner.show('Takeout');
			this.citationDrawer = new featuredCitationLayout({ model: this.project });
			Zeega.citation = this.citationDrawer; // I don't like this

			this.citationDrawer.render();
			$('#nav-lower').html( this.citationDrawer.el );

		},

		exit : function()
		{
			this.player.exit();
			//this.citationDrawer.remove();
		}

	});

	var featuredCitationLayout = Backbone.Layout.extend({
		template: "citation-featured",
		id: 'citation-drawer',

		serialize : function(){ return this.model.toJSON(); },

		initialize : function()
		{
			var _this = this;
			var showCitation = function()
			{
				if(_this.$el.is(':hidden'))
				{
					_this.$el.show('blind',{direction:'vertical'},500);
					hideDebounce();
				}
			};
			var closeCitation = function()
			{
				if(_this.$el.is(':visible'))
					_this.$el.hide('blind',{direction:'vertical'},1000);
			};

			var showThrottled = _.throttle(showCitation, 1000);
			var hideDebounce = _.debounce(closeCitation, 5000);


			$(window).mousemove(function(e){
				if(window.innerHeight - e.pageY < 111) showThrottled();
			});	
			$(window).mousemove(function(e){
				if(window.innerHeight - e.pageY < 111) hideDebounce();
			});
			hideDebounce();
		},

		cleanup : function()
		{
			$(window).unbind('mousemove');

			//this.timeout = 
		},

		afterRender : function()
		{
			var _this = this;
			this.collection = new featuredItemCollection();
			this.collection.id = this.model.get('description');
			this.collection.fetch().success(function(){

				_this.collection.each(function(item, i){
					if( i > 20 ) return false;
					item.set('collection_id', _this.collection.id);
					var iv = new featuredItemView({
						model:item,
						attributes: {
							'style': item.get('thumbnail_url') ? 'background:url('+ item.get('thumbnail_url') +');background-size:115% auto; background-position:center' : ''
						}
					});
					iv.render();
					_this.$('#featured-items-drawer').append( iv.el );
				});
			});
		}

	});


	var featuredItemCollection = Backbone.Collection.extend({
		url : function()
		{
			return localStorage.api + '/items/'+ this.id +'/items';
		},
		parse : function(res){ return res.items; }
	});

	var featuredItemView = Backbone.LayoutView.extend({
		template : 'item-featured',
		tagName : 'li',

		className : 'item-view',

		serialize : function(){ return this.model.toJSON(); }

	});

	var Project = Backbone.Model.extend({

		url : function()
		{
			//return 'http://alpha.zeega.org/api/items/46332'; //debug project
			
			if( this.isNew() )
			{
				return localStorage.api + '/items/'+ Zeega.featureList[Math.floor(Math.random() * Zeega.featureList.length)];
			}
			else return localStorage.api + '/items/'+ this.id;
		},

		defaults : {
			mode :'standalone',

			navbar_top : false,
			navbar_bottom : false,
			layerCitations : false,
			playerCitation : false,

			chromeless : true,
			branding : false,
			social : false,
			fullscreenEnabled : false,
			fadeOutOverlays : false
		},

		parse : function(resp){
			return resp.items[0].text;
		}

	});

	return Index;

});
