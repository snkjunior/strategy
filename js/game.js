var game = {
    playerId: 1,
    screen: {
        width: 1024,
        height: 500
    },
    
    cMap: null,
    
    hero: {
        class: 'scout',
        locationId: 'region2_abandodedHuntersCamp'        
    },
    resources: {
        wood: 0
    },
    equipment: [],
    quests: {},
    
    
    
    
    
    data: {},
    maps: {
        map1: ''
    },

    currentInterface: null,
    interfaces: {},
    components: {}
};

game.init = function() {
    $("#interface").css('width', game.screen.width);
    $("#interface").css('height', game.screen.height);    
   
    this.loadData();
    
    this.initTemplates();
    //this.showInterface('battle', {});
    this.cMap = game.maps.map1;
    this.showInterface('map', game.maps.map1);
    
    //this.showInterface('region', this.cMap.regions[2]);
    //this.showInterface('location', {locationId: this.hero.locationId});
    //this.showInterface('dialog', game.cMap.objects["craftsman"]);
};

game.loadData = function() {
    var loadData = function(url) {
        var response = $.ajax({url: url + "?_=" + new Date().getTime(), async: false});
        return response.responseJSON;
    };

    game.data = {
        battle: {
            objects: loadData('data/battle/objects.json'),
            terrains: loadData('data/battle/terrains.json')
        },
        units: loadData('data/units.json'),
        skills: loadData('data/skills.json')
    };
    
    for (var mapName in game.maps) {
        game.maps[mapName] = loadData('data/maps/' + mapName + '.json');
        game.maps[mapName].locations = loadData('data/maps/' + mapName + '/locations.json');
        game.maps[mapName].quests = loadData('data/maps/' + mapName + '/quests.json');
        game.maps[mapName].objects = loadData('data/maps/' + mapName + '/objects.json');
    }
    
    for (var skillId in game.data.skills) {
        game.data.skills[skillId].condition = new Function('unit, target', game.data.skills[skillId].condition);
    }
};

game.initTemplates = function() {
    for (var name in this.interfaces) {
        $.ajax({
            url: "templates/" + name + ".html",
            async: false,
            cache: false,
            success: function(html) {
                game.interfaces[name].template = html;
            }
        });
    }
};

game.showInterface = function(interfaceName, params) {    
    if (game.currentInterface != null) {
        game.currentInterface.onEnd();
    }
    
    game.currentInterface = game.interfaces[interfaceName];
    $("#interface").html(game.currentInterface.template);
    game.currentInterface.init(function() {
        ko.renderTemplate('interface', game.currentInterface, {}, document.getElementById('interface'));
        if (game.currentInterface.onReady != null) {
            game.currentInterface.onReady();
        }
        $("#interface").show();
    }, params);
};

game.hideInterface = function() {
    $("#interface_bg").hide();
    $("#interface").hide();
    game.currentInterface = null;
    $("#interface").html('');
};

game.animateFrame = function() {
    requestAnimFrame(game.animateFrame);
    game.pixi.renderer.render(game.pixi.stage);
};
