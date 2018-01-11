game.components.other = {
    objectToArray: function(object) {
        return Object.keys(object).map(function(key) {return object[key]});
    },
    
    getRandomSprite: function(sprites) {
        return sprites[Math.floor(Math.random() * sprites.length)];
    }
};


