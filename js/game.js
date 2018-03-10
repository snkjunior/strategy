var game = {
    playerId: 1,
    screen: {
        width: 1024,
        height: 600
    },
	menuHeight: 100,
	
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
	
	officers: {
		mainHero: {
			name: 'Hero',
			avatar: 'avatar_human_militiaman',
			unitsSlots: 1
		}		
	},
    
    hero: null,
    resources: {
        wood: 0
    },
    equipment: [],
    quests: {
        // pickingBerries: {
            // isFinished: false,
			// notes: ["1", "2"],
            // vars: {}
        // }
		// arrival: {
			// 
			// vars: {}
		// },
		// source: {
			// isFinished: false,
			// notes: [1],
			// vars: {}
		// },
//        restoreCamp: {
//            isFinished: false,
//            notes: [1, 2, 3]
//			  vars: {}
//        }
    },
    events: {},
    
    data: {},
    missions: {
		// Act1_Sacrifice: null,
        // goblin_invasion: null,
        GameCoreTest: null
    },

    currentInterface: null,
    interfaces: {},    
    components: {},
	infoBlockTemplates: {
		'test': '<div id="test"><div data-bind="text: testText"></div></div>'
	}
};

game.init = function() {
	$("#interface").css('width', game.screen.width);
	$("#interface").css('height', game.screen.height);   
	$("#interfaceContent").css('width', game.screen.width - 4);
	$("#interfaceContent").css('height', game.screen.height);	
   
	this.loadData();    
    this.initTemplates();
    this.initEventWindow();
    this.initMenu();

    this.cMission = game.missions.GameCoreTest;
    this.cMap = this.cMission.maps[this.cMission.startMap];
    this.hero = this.cMission.startHero;
    this.showInterface('map');
    
    
    //game.components.actions.processActions(this.cMission.onload);
    
	// this.showInterface('battle', {enemies: [
		// {unitType: 'animal_wolf'},
		// {unitType: 'animal_wolf'},
		// {unitType: 'animal_wolf'},
		// {unitType: 'animal_wolf'},
		// {unitType: 'animal_wolf'},
		// {unitType: 'animal_wolf'},
        // {unitType: 'animal_wolf'},
		// {unitType: 'animal_wolf'}
	// ]});
	
	//this.showInterface('quests');
    //this.showInterface('editor');
	//this.showInterface('army');
    
    //game.components.actions.changeMap({mapId: 'villageGreyshow', locationId: 'elderHome'});
    
    //this.showInterface('location', {locationId: this.hero.locationId});
    //this.showInterface('dialog', game.cMap.objects["craftsman"]);
	
	//this.components.infoBlock.show('test', {testText: 123});
    
    
};

game.initMenu = function() {
    $('.navMenuButton').on('click', function() {
        var interfaceName = $(this).attr('data-interface');
        $('.navMenuButton').removeClass('active');
        $(this).addClass('active');
        game.showInterface(interfaceName);
    });
}

game.getCurrentScreenHeight = function() {
	if ($("#navMenu").is(':visible')) {
		return game.screen.height - game.menuHeight;
	}
	return game.screen.height;
}

game.setMenuVisible = function(isShowMenu) {
	$("#interfaceContent").css('height', (!isShowMenu ? game.screen.height : game.screen.height - game.menuHeight));  	
	if (isShowMenu) {
		$("#navMenu").show();		
	} else {
		$("#navMenu").hide();
	}	
};

game.initEventWindow = function() {    
    $('#eventPopup').html(game.interfaces.event.template);
    ko.renderTemplate('eventPopup', game.interfaces.event, {}, document.getElementById('eventPopup'));
};

game.loadData = function() {
    var loadData = function(url) {
        var response = $.ajax({url: url + "?_=" + new Date().getTime(), async: false, dataType: 'json'});
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
        game.missions[missionName] = loadData('data/missions/' + missionName + '/description.json');	   
        game.missions[missionName].quests = loadData('data/missions/' + missionName + '/quests.json');
        for (var mapName in game.missions[missionName].maps) {
			game.missions[missionName].maps[mapName] = loadData('data/missions/' + missionName + '/' + mapName + '/mapInfo.json');
			if (game.missions[missionName].maps[mapName]) {
				game.missions[missionName].maps[mapName].locations = loadData('data/missions/' + missionName + '/' + mapName + '/locations.json');
				game.missions[missionName].maps[mapName].events = loadData('data/missions/' + missionName + '/' + mapName + '/events.json');
				game.missions[missionName].maps[mapName].triggers = loadData('data/missions/' + missionName + '/' + mapName + '/triggers.json');
			}
		}
    }
    
    
    
    for (var skillId in game.data.skills) {
        game.data.skills[skillId].condition = new Function('unit, target, hex', game.data.skills[skillId].condition);
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

game.showEvent = function(eventId, initState) {
    var eventData = game.cMap.events[eventId];
    game.interfaces.event.show(eventData, initState);
    game.interfaces.event.onReady();
};

game.hideEvent = function() {
    game.interfaces.event.hide();
};

game.showInterface = function(interfaceName, params) {    
    if (game.currentInterface != null) {
        game.currentInterface.onEnd();
    }
    
    game.currentInterface = game.interfaces[interfaceName];
    $("#interfaceContent").html(game.currentInterface.template);
    game.currentInterface.init(function() {
        ko.renderTemplate('interfaceContent', game.currentInterface, {}, document.getElementById('interfaceContent'));
        if (game.currentInterface.onReady != null) {
            game.currentInterface.onReady();
        }
        $("#interfaceContent").show();
    }, params);    
};

game.hideInterface = function() {
    $("#interfaceContent_bg").hide();
    $("#interfaceContent").hide();
    game.currentInterface = null;
    $("#interfaceContent").html('');
};

game.animateFrame = function() {
    requestAnimFrame(game.animateFrame);
    game.pixi.renderer.render(game.pixi.stage);
};

game.startBattle = function(enemies, battlefield, result) {
    var battleData = {
        units: this.hero.units,
        battlefield: battlefield,
        enemies: enemies,
        result: result
    };
    this.showInterface("battle", battleData);
};