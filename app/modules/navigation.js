define([
	"zeega",
	// Libs
	"backbone",
	'libs/modernizr',
	// Plugins
	'zeega_player',
	'libs/leaflet'
],

function(Zeega, Backbone)
{

	// Create a new module
	var App = Zeega.module();


	App.Collections = {};


	App.Views.UpperNavView = Backbone.View.extend({
		manage : true,
		template : 'upper-nav',

		tagName : 'ul'
	});


	// Required, return the module for AMD compliance
	return App;
});
