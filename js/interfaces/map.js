game.interfaces.map = {
    template: "",
    
    locationRadius: 32,
    
    width: null,
    height: null,
    
    locations: {},
    roads: [],
    visibleLocations: ko.observableArray([]),
    
    currentHeroLocation: ko.observable(null),
    mouseOverLocation: ko.observable(null),
    selectedLocation: ko.observable(null),
    
    init: function(callback, params) {
        var self = game.interfaces.map;
		var map = game.cMap;
        if (map != null) {
            self.width = map.width;
            self.height = map.height;        
            self.locations = map.locations;
            self.roads = map.roads;
        }
        
        self.currentHeroLocation(self.locations[game.hero.locationId]);
        self.selectedLocation(self.currentHeroLocation());
        
        self.updateVisibleLocations();
		
		
        
        callback();
    },
    
    onReady: function() {
        var self = game.interfaces.map;
        
        if (game.screen.width < self.width + 100 || game.getCurrentScreenHeight() < self.height + 100) {
            if (game.getCurrentScreenHeight() < self.height + 100) {
                $('#map').css('border-top-width', 0);
                $('#map').css('border-bottom-width', 0);
                $('#map').css('left', (game.screen.width - self.width) / 2 + 'px');
            }
            
            if (game.screen.width < self.width + 100) {
                $('#map').css('border-left-width', 0);
                $('#map').css('border-right-width', 0);
                $('#map').css('top', (game.getCurrentScreenHeight() - self.height) / 2 + 'px');
            }
            
            // Start: Center map on current location //
            $('#map').css('left', (game.screen.width / 2 - self.currentHeroLocation().x ) + 'px');
            if (parseInt($('#map').css('left')) > 50) {
                $('#map').css('left', '50px');
            }
            if (parseInt($('#map').css('left')) < -self.width + game.screen.width - 50) {
                $('#map').css('left', (-self.width + game.screen.width - 50) + 'px');
            }
            
            $('#map').css('top', (game.getCurrentScreenHeight() / 2 - self.currentHeroLocation().y ) + 'px');
            if (parseInt($('#map').css('top')) > 50) {
                $('#map').css('top', '50px');
            }
            if (parseInt($('#map').css('top')) < -self.height + game.getCurrentScreenHeight() - 50) {
                $('#map').css('top', (-self.height + game.getCurrentScreenHeight() - 50) + 'px');
            }
            // End //
            
            $('#map').draggable({
                drag: function(event, ui) {
                    if (game.getCurrentScreenHeight() <= self.height + 100) {
                        if (ui.offset.top > 50) {
                            ui.position.top = 50;
                        }
                        if (ui.offset.top < -self.height + game.getCurrentScreenHeight() - 50) {
                            ui.position.top = -self.height + game.getCurrentScreenHeight() - 50;
                        }
                    }
                    else {
                        ui.position.top = (game.getCurrentScreenHeight() - self.height) / 2;
                    }

                    if (game.screen.width <= self.width + 100) {
                        if (ui.offset.left > 50) {
                            ui.position.left = 50;
                        }
                        if (ui.offset.left < -self.width + game.screen.width - 50) {
                            ui.position.left = -self.width + game.screen.width - 50;
                        }
                    } 
                    else {
                        ui.position.left = (game.screen.width - self.width) / 2
                    }
                }
            });
        } else {
            $('#map').css('left', (game.screen.width - self.width) / 2 + 'px');
            $('#map').css('top', (game.getCurrentScreenHeight() - self.height) / 2 + 'px');
        }
        
        $("#interfaceContent").bind('mousemove', function(e) {
            game.interfaces.map.onMouseMove(e);
        });
		
		game.setMenuVisible(true);
    },
    
    onEnd: function() {
        $("#interfaceContent").unbind('mousemove');
    },
    
    onMouseMove: function(e) {
        var self = game.interfaces.map;
        if ($(e.target).prop('tagName') == 'IMG' && $(e.target).hasClass('location')) {
            var borderWidth = parseInt($('#map').css('border-width')) + parseInt($('#interfaceContent').css('border-width'));
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
    
    updateVisibleLocations: function() {
        var self = game.interfaces.map;
        var visibleLocations = [];
        for (var locationId in self.locations) {
            if (self.isLocationVisible(self.locations[locationId])) {
                visibleLocations.push(locationId);
            }
        }
        self.visibleLocations(visibleLocations);
    },
    
    isLocationVisible: function(location) {
        return (location.isVisible || (game.hero.knownLocations[game.cMap.id] && game.hero.knownLocations[game.cMap.id].indexOf(location.id) !== -1)) && game.components.conditions.isVisible(location.visibleConditions);
    },
    
    getLocationSprite: function(location) {
        var self = game.interfaces.map;
        var sprite = location.sprite;
        if (sprite === null) {
            sprite = "sign_post.png";
        }
        
        if (self.mouseOverLocation() === location) {
            sprite = "hover_" + sprite;
        } else {
            if (self.selectedLocation() === location) {
                sprite = "selected_" + sprite;
            }
        }
        
        return sprite;
    },
    
    getSelectedLocationActionSprite: function(location) {
        var self = game.interfaces.map;
        var sprite = 'move_to_location.png';
        if (self.currentHeroLocation() === location) {
            sprite = 'enter_location.png';
        }
        return sprite;
    },
    
    clickLocation: function() {
        var self = game.interfaces.map;
        if (self.mouseOverLocation() != null) {
            self.selectedLocation(self.mouseOverLocation());
        }
    },   
    
    clickAction: function(location) {
        var self = game.interfaces.map;
        if (self.currentHeroLocation() === location) {
            self.enterLocation();
        } else {
            self.travelToLocation();
        }
    },
    
    travelToLocation: function() {
        var self = game.interfaces.map;
        
        var dx = self.selectedLocation().x - self.currentHeroLocation().x;
        var dy = self.selectedLocation().y - self.currentHeroLocation().y;
        
        $('#heroLocationPointer').animate({
            left: "+=" + dx,
            top: "+=" + dy
        }, 2000, function() {
            self.currentHeroLocation(self.selectedLocation());
            game.hero.locationId = self.currentHeroLocation().id;
            if (game.components.triggers.processActiveTriggersByType(self.currentHeroLocation().triggers, game.cMap.triggers, "onLocationArrival")) {
                self.updateVisibleLocations();
            }
        });
    },
    
    enterLocation: function() {
        var self = game.interfaces.map;
        game.showInterface('location');
    },
    
    getRoadCsvInfo: function(road) {
        var self = game.interfaces.map;
        
        if (self.visibleLocations().indexOf(road.locations[0]) === -1 || self.visibleLocations().indexOf(road.locations[1]) === -1) {
            return null;
        }
        
        var left = self.locations[road.locations[0]].x < self.locations[road.locations[1]].x ? self.locations[road.locations[0]].x : self.locations[road.locations[1]].x; 
        var top = self.locations[road.locations[0]].y < self.locations[road.locations[1]].y ? self.locations[road.locations[0]].y : self.locations[road.locations[1]].y; 
        
        return {
            left: left,
            top: top,
            width: Math.abs(self.locations[road.locations[0]].x - self.locations[road.locations[1]].x),
            height: Math.abs(self.locations[road.locations[0]].y - self.locations[road.locations[1]].y) + 16,
            x1: self.locations[road.locations[0]].x - left,
            x2: self.locations[road.locations[1]].x - left,
            y1: self.locations[road.locations[0]].y - top + 16,
            y2: self.locations[road.locations[1]].y - top + 16
        };
    }
};
