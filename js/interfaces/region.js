game.interfaces.region = {
    template: "",
    
    locationRadius: 16,
    
    locations: {},
    
    mouseOverLocation: ko.observable(null),
    
    init: function(callback, region) {
        var self = game.interfaces.region;
        if (region != null) {
            self.locations = {};
            for (var i = 0; i < region.locations.length; i++) {
                self.locations[region.locations[i]] = game.cMap.locations[region.locations[i]];
            }
        }
        callback();
    },
    
    onReady: function() {
        $("#interface").bind('mousemove', function(e) {
            game.interfaces.region.onMouseMove(e);
        });
    },
    
    onEnd: function() {
        $("#interface").unbind('mousemove');
    },
    
    onMouseMove: function(e) {
        var self = game.interfaces.region;
        if ($(e.target).prop('tagName') == 'DIV' && $(e.target).hasClass('location')) {
            var borderWidth = parseInt($('#region').css('border-width'));
            
            var mx = e.clientX - borderWidth;
            var my = e.clientY - borderWidth;
            var cameraDx = $('#region').css('left') === 'auto' ? 0 : parseInt($('#region').css('left'));
            var cameraDy = $('#region').css('top') === 'auto' ? 0 : parseInt($('#region').css('top'));
            
            var location = self.locations[$(e.target).attr('locationId')];

            var distance = game.components.geom.getDistanceBetweenPoints(mx, my, location.x + cameraDx, location.y + cameraDy);
            if (distance <= self.locationRadius) {
                self.mouseOverLocation(location);
                return;
            }
        }
        self.mouseOverLocation(null);
    },
    
    clickLocation: function() {
        var self = game.interfaces.region;
        if (self.mouseOverLocation() != null) {
            game.hero.locationId = self.mouseOverLocation().id;
            game.showInterface('location', null);
        }
    },
    
    clickBack: function() {
        game.showInterface("map", null);
    }
};