var game = {
    playerId: 1,
    screen: {
        width: 1024,
        height: 500
    },
    
    cMission: null,
    cMap: null,
    
    time: {
        minutes: 0,
        hours: 8,
        day: 1,
        addTime: function(min) {
            var addHours = Math.floor(min / 60);
            this.minutes += min % 60;
            if (this.minutes >= 60) {
                this.minutes -= 60;
                addHours += 1;
            }
            
            this.hours += addHours;
            if (this.hours >= 24) {
                this.day += Math.floor(this.hours / 24);
                this.hours = this.hours % 24;
            }
        },
        getTime: function() {
            return {day: this.day, hours: this.hours, minutes: this.minutes};
        }
    },
    
    hero: {
        exp: 0,
        class: 'scout',
        locationId: 'roadToKingdom',
        units: {
            human_hunter: 3,
            human_militiaman: 1
        },
        knownLocations: {
            //"westRegion": ["forestTrail"]
        }
    },
    resources: {
        wood: 0
    },
    equipment: [],
    quests: {
//        restoreCamp: {
//            isFinished: false,
//            notes: [1, 2, 3]
//        }
    },
    
    data: {},
    missions: {
        act1_sacrifice: null
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
    this.showInterface('battle', {
        units: this.hero.units,
        enemies: {
            animal_wolf: 4
        },
        result: [
            
        ]
    });
//    this.cMission = game.missions.act1_sacrifice;
//    this.cMap = game.missions.act1_sacrifice.maps.westRegion;
//    this.showInterface('map', this.cMap);
    
//    this.showInterface('editor');
    
    //game.components.actions.changeMap({locationId: 'villageGate', mapId: 'villageGreyshow'});
    
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
        units: loadData('data/units_v2.json'),
        skills: loadData('data/skills_v2.json')
    };
    
    for (var missionName in game.missions) {
        game.missions[missionName] = loadData('data/missions/' + missionName + '.mission.json');
//        game.missions[missionName].quests = loadData('data/missions/' + missionName + '/quests.json');
//        for (var mapName in game.missions[missionName].maps) {
//            game.missions[missionName].maps[mapName] = loadData('data/missions/' + missionName + '/' + mapName + '.mission');
//            game.missions[missionName].maps[mapName].locations = loadData('data/missions/' + missionName + '/' + mapName + '/locations.json');
//            game.missions[missionName].maps[mapName].objects = loadData('data/missions/' + missionName + '/' + mapName + '/objects.json');
//            game.missions[missionName].maps[mapName].triggers = loadData('data/missions/' + missionName + '/' + mapName + '/triggers.json');
//        }
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

game.startBattle = function(enemies, result) {
    var battleData = {
        units: this.hero.units,
        enemies: enemies,
        result: result
    };
    this.showInterface("battle", battleData);
};
