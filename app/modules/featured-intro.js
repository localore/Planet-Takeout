define([
	"zeega",
	// Libs
	"backbone"
],

function(Zeega, Backbone) {
	var FeaturedIntro = Zeega.module();

	FeaturedIntro.View = Backbone.LayoutView.extend({
		template: 'featured-intro',
		takeoutName: 'Untitled',
		serialize : function(){ return this; }
	});

	return FeaturedIntro;
});
