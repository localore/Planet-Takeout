define([
	"zeega",
	// Libs
	"backbone",
	//submodules
	'modules/submodules/modals',

	//libraries
	'libs/modernizr',
	'libs/leaflet',
	// Plugins
	'zeega_player'
],

function(Zeega, Backbone, Modal)
{

	// Create a new module
	var App = Zeega.module();


	App.Collections = {};

	App.Views.Map = Modal.Views._Page.extend({
		template: 'map',
		id: 'PT-map-wrapper',

		ptIconRed : L.icon({
			iconUrl : 'assets/img/map-marker-00.png',
			iconSize: [20,20],
			iconAnchor : [11,0]
		}),

		serialize : function(){ return {rand_id: this.randomID  }; },

		initialize : function()
		{
			this.collection = new App.Collections.MapItems();
		},

		afterRender : function()
		{
			this.renderMap();
			this.renderCollectionMarkers();
		},

		renderMap : function()
		{
			var start = new L.LatLng(42.36431523548288, -71.07180118560791 );

			this.map = L.map('PT-map',{
				attributionControl:false
			}).setView(start, 12);

			L.tileLayer('http://{s}.tiles.mapbox.com/v2/mapbox.mapbox-streets/{z}/{x}/{y}.png', {
				maxZoom: 18
			}).addTo( this.map );
		},

		renderCollectionMarkers : function()
		{
			var _this = this;

			var renderMarkers = function()
			{
				_this.collection.each(function(item){
					//          console.log('lat lng', _this.collection, item, [ item.get('media_geo_latitude'), item.get('media_geo_longitude')]);
					item.marker = L.marker([ item.get('media_geo_latitude') || 0, item.get('media_geo_longitude') || 0 ], {icon: _this.ptIconRed} );
					item.marker.itemID = item.id;
					item.marker.addTo(_this.map);

					item.marker.on('click', function(e){ _this.onMarkerClick(e); } );
				});
			};

			this.collection.fetch().success(function(){
				renderMarkers();
			});
		},

		onMarkerClick : function(e)
		{
			console.log('clicked', e, e.target.getLatLng() );
			var item = this.collection.get(e.target.itemID);
			var content = new App.Views.MapPopup({model:item});
			this.popup = L.popup();
			this.popup.setLatLng([ e.target.getLatLng().lat, e.target.getLatLng().lng ])
				.setContent( content.render().el )
				.openOn(this.map);

			$(this.popup._wrapper).css({
				'background': item.get('thumbnail_url') ? 'url('+ item.get('thumbnail_url') +')' : 'grey',
				'background-size' : '100% auto'
			});
			console.log(this.popup);


		}

	});

	App.Collections.MapItems = Backbone.Collection.extend({
		initialize : function(){ console.log('colection init');},
		url: function()
		{
			return localStorage.api + '/items/46086/items';
		},

		parse : function(res){ return res.items; }
	});

	App.Views.MapPopup = Backbone.View.extend({

		className : 'map-popup',

		render : function()
		{
			this.$el.html( _.template( this.template(), this.model.toJSON() ) );
			return this;
		},

		events : {
			'click' : 'enterCollectionViewer'
		},

		enterCollectionViewer : function()
		{
			// for some reason, the relative url wasn't working correctly. navigate works though
			console.log('enter collectoin', this);
			Zeega.router.navigate('/collections/'+ this.model.id +'/view', {'trigger':true});
			return false;
		},

		template : function()
		{
			var html = 

			'<a href="/collections/<%= id %>/view" class="enter"><img src="assets/img/arrow-straight.png" width="40px"/></a>';        

			return html;
		}

	});


	// Required, return the module for AMD compliance
	return App;
});