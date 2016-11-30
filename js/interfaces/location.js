game.interfaces.location = {
    template: "",
    
    location: null,
    
    init: function(callback, params) {
        var self = game.interfaces.location;
        self.location = game.cMap.locations[game.hero.locationId];
        callback();
    },
    
    onReady: function() {
     
    },
    
    onEnd: function() {
        
    },
    
    clickObject: function(object) {
        game.showInterface('dialog', object);
    },
    
    clickBack: function() {
        var self = game.interfaces.location;
        if (self.location.parentLocation === "") {
            game.showInterface('region', game.cMap.regions[self.location.region]);
        } 
        else {
            game.showInterface('location', game.cMap.locations[self.location.parentLocation]);
        }
    }
};