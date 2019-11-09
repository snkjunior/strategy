var game = {
    playerId: 1,
    screen: {
        width: 1024,
        height: 600
    },
	menuHeight: 64,
	
    cMission: null,
    cMap: null,
    
    time: {
        minutes: 0,
        hours: 0,
        day: 0,
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
        setTime: function(data) {
            if (data.day) {
                this.day = data.day;
            }
            if (data.hours) {
                this.hours = data.hours;
            }
            if (data.minutes) {
                this.minutes = data.minutes;
            }
        },
        getTime: function() {
            return {day: this.day, hours: this.hours, minutes: this.minutes, period: this.getDayPeriod};
        },
        getDayPeriod: function() {
            if ((this.hours >= 22 && this.hours <= 23) || (this.hours >= 0 && this.hours <= 4)) {
                return 'night';
            }
            if (this.hours >= 5 && this.hours <= 10) {
                return 'morning';
            }
            if (this.hours >= 11 && this.hours <= 16) {
                return 'day';
            }
            return 'evening';
        }
    },
	
    // Перенести в data - тип персонажа
	officers: {
		mainHero: {
			name: 'Hero',
			avatar: 'avatar_human_militiaman',
			unitsSlots: 1
		}		
	},
    
    hero: null,
    inventory: [],
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
		//Act1_Sacrifice: null,
        Act1_GoblinInvasion: null,
        //GameCoreTest: null
    },

    currentInterface: null,
    interfaces: {},    
    components: {},
	infoBlockTemplates: {
		test: {
            html: '<div style="background-color: red"><div data-bind="text: testText"></div></div>',
            width: 200,
            height: 300
        }            
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

    this.cMission = game.missions.Act1_GoblinInvasion;
    this.cMap = this.cMission.maps[this.cMission.startMap];
    this.hero = this.cMission.startHero;
    this.inventory = this.cMission.startInventory;
    if (this.cMission.startTime) {
        this.time.setTime(this.cMission.startTime);
    }
    this.showInterface('map');
    
    //game.components.actions.processActions(this.cMission.onload);
    
	// this.startBattle(
        // [
            // {"unitType": "animal_snake", "x": 4, "y": 2}
        // ],
        // {
            // "width": 5,
            // "height": 5,
            // "objects": [
                // {"x": 1, "y": 1, "id": "forest"},
                // {"x": 2, "y": 2, "id": "forest"},
                // {"x": 0, "y": 0, "id": "mountain"}
            // ],
            // "hexesToPlaceUnits": [
                // {"x": 0, "y": 2}
            // ]                                    
        // },
        // {
            // "success": [
                // {"type": "addExp", "exp": 100},
                // {"type": "showEvent", "eventId": "pickingBerriesEvent", "initState": "3"},
                // {"type": "addQuestNote", "questId": "pickingBerries", "note": "3"}
            // ],
            // "failed": [
                // {"type": "addQuestNote", "questId": "pickingBerries", "note": "2"},
                // {"type": "showEvent", "eventId": "pickingBerriesEvent", "initState": "loseToSnake"}
            // ]
        // }
    // );
	
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
        return typeof(response.responseJSON) != 'undefined' ? response.responseJSON : [];
    };

    game.data = {
        battle: {
            objects: loadData('data/battle/objects.json'),
            terrains: loadData('data/battle/terrains.json')
        },
        units: loadData('data/units_v2.json'),
        skills: loadData('data/skills_v2.json'),
        items: loadData('data/items.json')
    };
    
    for (var missionName in game.missions) {
        game.missions[missionName] = loadData('data/missions/' + missionName + '/description.json');	   
        game.missions[missionName].quests = loadData('data/missions/' + missionName + '/quests.json');
        game.missions[missionName].items = loadData('data/missions/' + missionName + '/items.json');
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
    
    for (var unitId in game.data.units) {
        if (game.data.units[unitId].sprite == "") {
            game.data.units[unitId].sprite = "no_sprite_unit";
        }
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