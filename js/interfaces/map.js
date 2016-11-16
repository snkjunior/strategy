game.interfaces.map = {
    template: "",
    
    locationRadius: 16,
    
    width: null,
    height: null,
    
    locations: {},
    roads: [],
    
    mouseOverLocation: ko.observable(null),
    
    init: function(callback, params) {
        var self = game.interfaces.map;
        self.width = params.width;
        self.height = params.height;        
        self.locations = params.locations;
        self.roads = params.roads;
        
        callback();
    },
    
    onReady: function() {
        var self = game.interfaces.map;
        
        if (game.screen.width <= self.width || game.screen.height <= self.height) {
            if (game.screen.height <= self.height) {
                $('#map').css('border-top-width', 0);
                $('#map').css('border-bottom-width', 0);
            }
            if (game.screen.width <= self.width) {
                $('#map').css('border-left-width', 0);
                $('#map').css('border-right-width', 0);
            }
            
            $('#map').draggable({
                drag: function(event, ui) {
                    if (game.screen.height <= self.height) {
                        if (ui.offset.top > 0) {
                            ui.position.top = 0;
                        }
                        if (ui.offset.top < -self.height + game.screen.height) {
                            ui.position.top = -self.height + game.screen.height;
                        }
                    }
                    else {
                        ui.position.top = (game.screen.height - self.height) / 2;
                    }

                    if (game.screen.width <= self.width) {
                        if (ui.offset.left > 0) {
                            ui.position.left = 0;
                        }
                        if (ui.offset.left < -self.width + game.screen.width) {
                            ui.position.left = -self.width + game.screen.width;
                        }
                    } 
                    else {
                        ui.position.left = (game.screen.width - self.width) / 2
                    }
                }
            });
        } else {
            $('#map').css('left', (game.screen.width - self.width) / 2 + 'px');
            $('#map').css('top', (game.screen.height - self.height) / 2 + 'px');
        }
        
        $("#interface").bind('mousemove', function(e) {
            game.interfaces.map.onMouseMove(e);
        });
    },
    
    onMouseMove: function(e) {
        var self = game.interfaces.map;
        
        if ($(e.target).prop('tagName') == 'DIV' && $(e.target).hasClass('location')) {
            var borderWidth = parseInt($('#map').css('border-width')) + parseInt($('#interface').css('border-width'));
            var mx = e.clientX - borderWidth;
            var my = e.clientY - borderWidth;
            var cameraDx = $('#map').css('left') === 'auto' ? 0 : parseInt($('#map').css('left'));
            var cameraDy = $('#map').css('top') === 'auto' ? 0 : parseInt($('#map').css('top'));
            
            var location = self.locations[$(e.target).attr('locationId')];

            var distance = game.components.geom.getDistanceBetweenPoints(mx, my, location.x + cameraDx, location.y + cameraDy);
            if (distance <= self.locationRadius) {
                self.mouseOverLocation(location);
                return;
            }
        }
        self.mouseOverLocation(null);
    },
    
    getRoadCsvInfo: function(roads) {
        var self = game.interfaces.map;
        
        var left = self.locations[roads[0]].x < self.locations[roads[1]].x ? self.locations[roads[0]].x : self.locations[roads[1]].x; 
        var top = self.locations[roads[0]].y < self.locations[roads[1]].y ? self.locations[roads[0]].y : self.locations[roads[1]].y; 
        
        return {
            left: left,
            top: top,
            width: Math.abs(self.locations[roads[0]].x - self.locations[roads[1]].x),
            height: Math.abs(self.locations[roads[0]].y - self.locations[roads[1]].y),
            x1: self.locations[roads[0]].x - left,
            x2: self.locations[roads[1]].x - left,
            y1: self.locations[roads[0]].y - top,
            y2: self.locations[roads[1]].y - top
        };
    },
};
