game.interfaces.map = {
    template: "",
    
    defaultSettings: {
        showLocationName: ko.observable(true),
    },
    
    settings: {
        
    },
    
    actionRadius: 16,
    locationRadius: 16,
    roadLocationRadius: 8,
    
    width: null,
    height: null,
    
    locations: {},
    roads: [],
    locationsArray: ko.observableArray([]),
    
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
            if (map.useRoads) {
                self.roads = map.roads;
            }
            self.settings = self.defaultSettings;
            if (map.settings) {
                for (var settingName in map.settings) {
                    if (self.settings[settingName]) {
                        self.settings[settingName](map.settings[settingName]);
                    }
                }
            }
        }
        
        self.locationsArray(game.components.other.objectToArray(self.locations));
        
        self.currentHeroLocation(self.locations[game.hero.locationId]);
        self.selectedLocation(self.currentHeroLocation());
        
        //self.updateVisibleLocations();
		
		
        
        callback();
    },
    
    onReady: function() {
		game.setMenuVisible(true);
		
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
            if (distance <= self.locationRadius && !location.isRoadLocation) {
                self.mouseOverLocation(location);
                return;
            }
        }
        self.mouseOverLocation(null);
    },
    
    updateMap: function() {
        var self = game.interfaces.map;
        var locations = self.locationsArray();
        self.locationsArray([]);
        self.locationsArray(locations);
    },
    
    // updateVisibleLocations: function() {
        // var self = game.interfaces.map;
        // var visibleLocations = [];
        // for (var locationId in self.locations) {
            // if (self.isLocationVisible(self.locations[locationId])) {
                // visibleLocations.push(locationId);
            // }
        // }
        // self.visibleLocations(visibleLocations);
    // },
    
    isLocationVisible: function(location) {
        return (
            location.isVisible || 
            (
                game.hero.knownLocations[game.cMap.id] 
                && game.hero.knownLocations[game.cMap.id].indexOf(location.id) !== -1
            )
        ) && game.components.conditions.isVisible(location.visibleConditions);
    },
    
    getLocationSprite: function(location) {
        var self = game.interfaces.map;
        var sprite = location.sprite;
        if (sprite === null) {
            sprite = "location.png";
        }
        
        if (self.selectedLocation() === location) {
            sprite = "selected_" + sprite;
        } else if (self.mouseOverLocation() === location) {
            sprite = "hover_" + sprite;
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
        if (self.mouseOverLocation() != null && self.mouseOverLocation().isRoadLocation) {
            self.selectedLocation(self.mouseOverLocation());
        }
    },   
    
    clickAction: function(location) {
        var self = game.interfaces.map;
        if (!location.isRoadLocation) {
            game.components.actions.processActions(location.actions);
            self.selectedLocation(location);
            self.currentHeroLocation(location);
            game.hero.locationId = self.currentHeroLocation().id;
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
        var self = game.interfaces.map,
            location1 = self.locations[road.locations[0]],
            location2 = self.locations[road.locations[1]];
        
        if (!location1 || !location2 || !self.isLocationVisible(location1) || !self.isLocationVisible(location2)) {
            return null;
        }
        
        var left = location1.x < self.locations[road.locations[1]].x ? location1.x : location2.x; 
        var top = location1.y < self.locations[road.locations[1]].y ? location1.y : location2.y; 
        
        return {
            left: left,
            top: top,
            width: Math.abs(location1.x - location2.x),
            height: Math.abs(location1.y - location2.y),
            x1: location1.x - left,
            x2: location2.x - left,
            y1: location1.y - top,
            y2: location2.y - top
        };
    },
    
    getLocationLeft: function(location) {
        var self = game.interfaces.map;
        return location.x - (location.isRoadLocation ? self.roadLocationRadius : self.locationRadius);
    },
    
    getLocationTop: function(location) {
        var self = game.interfaces.map;
        return location.y - (location.isRoadLocation ? self.roadLocationRadius : self.locationRadius);
    },
    
    getLocationWH: function(location) {
        var self = game.interfaces.map;
        return (location.isRoadLocation ? self.roadLocationRadius : self.locationRadius) * 2;
    },
    
    getLocationCursor: function(location) {
        var self = game.interfaces.map;
        return (location.isRoadLocation ? 'default' : 'pointer');
    }
};
