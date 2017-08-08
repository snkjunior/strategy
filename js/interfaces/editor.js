game.interfaces.editor = {
    template: "",
    
    locationRadius: 32,
    tabs: [
        {id: 'mission', name: 'Миссия'},
        {id: 'maps', name: 'Карты'},
        {id: 'roads', name: 'Дороги'},
        {id: 'locations', name: 'Локации'},
        {id: 'objects', name: 'Объекты'}
    ],

    dialog: {
        interfacesInfo: {
            loadMission: {name: "Загрузка миссии", width: 400, height: 200},
            newMission: {name: "Новая миссия", width: 400, height: 200},
            addOrEditMap: {name: "Создать/редактировать карту", width: 400, height: 300},
        },
        
        isShow: ko.observable(false),
        type: ko.observable(null),
        info: ko.observable(null),
        data: ko.observable(null),
        show: function(type, data) {
            this.type(type);
            this.info(this.interfacesInfo[type]);
            this.data(data);
            this.isShow(true);
        },
        hide: function() {
            this.isShow(false);
            this.type(null);
            this.info(null);
            this.data(null);
        }
    },

    mission: ko.observable(null), 
    map: ko.observable(null),
    location: ko.observable(null),
    currentTab: ko.observable('Mission'),
    
    init: function(callback, params) {
        var self = game.interfaces.editor;
        
        self.mission(self._loadMission('act1_sacrifice'));
        self.selectMap('westRegion');
        
        
        
        //self.clickSaveMissionInterfaceButton();
        
        //self.dialog.show('addOrEditMap', {action: 'edit'});
        
        callback();
    },
    
    onReady: function() {
        if (this.map() != null) {
            this._redraggableMap();
        }
        
        this.clickTabInset(this.tabs[3]);
    },
    
    onEnd: function() {
        
    },
    
    _redraggableMap: function() {
        var self = game.interfaces.editor;
        
        if (parseInt($('#mapInterface').css('width')) < self.map().width + 100 || game.screen.height < self.map().height + 100) {
            if (game.screen.height < self.map().height + 100) {
                $('#map').css('border-top-width', 0);
                $('#map').css('border-bottom-width', 0);
                $('#map').css('left', (parseInt($('#mapInterface').css('width')) - self.map().width) / 2 + 'px');
            }
            
            if (parseInt($('#mapInterface').css('width')) < self.map().width + 100) {
                $('#map').css('border-left-width', 0);
                $('#map').css('border-right-width', 0);
                $('#map').css('top', (game.screen.height - self.map().height) / 2 + 'px');
            }
            
            $('#map').draggable({
                drag: function(event, ui) {
                    if (game.screen.height <= self.map().height + 100) {
                        if (ui.offset.top > 50) {
                            ui.position.top = 50;
                        }
                        if (ui.offset.top < -self.map().height + game.screen.height - 50) {
                            ui.position.top = -self.map().height + game.screen.height - 50;
                        }
                    }
                    else {
                        ui.position.top = (game.screen.height - self.map().height) / 2;
                    }

                    if (parseInt($('#mapInterface').css('width')) <= self.map().width + 100) {
                        if (ui.offset.left > 50) {
                            ui.position.left = 50;
                        }
                        if (ui.offset.left < -self.map().width + parseInt($('#mapInterface').css('width')) - 50) {
                            ui.position.left = -self.map().width + parseInt($('#mapInterface').css('width')) - 50;
                        }
                    } 
                    else {
                        ui.position.left = (parseInt($('#mapInterface').css('width')) - self.map().width) / 2
                    }
                }
            });
        } 
        $('#map').css('left', (parseInt($('#mapInterface').css('width')) - self.map().width) / 2 + 'px');
        $('#map').css('top', (game.screen.height - self.map().height) / 2 + 'px');
    },
    
    _getExistsMissions: function() {
        var response = $.ajax({url: "api.php?action=getMissionsList", async: false});
        return response.responseJSON;
    },
    
    _loadMission: function(missionName) {
        var response = $.ajax({url: "api.php?action=loadMission&name=" + missionName, async: false});
        return response.responseJSON;
    },
    
    _saveMission: function(missionId, data) {
        var response = $.ajax({type: 'POST', url:"api.php?action=saveMission&id=" + missionId, data: {data: JSON.stringify(data)}, async: false});
        return response.responseJSON;
    },
    
    clickTabInset: function(tab) {
        var self = game.interfaces.editor;
        self.currentTab(tab);
        if (tab.id === 'maps') {
            if (self.map() !== null) {
                $('#mapSelector').val(self.map().id);
            }
        }
    },
    
    clickShowLoadMissionInterfaceButton: function() {
        var self = game.interfaces.editor;
        var isContinue = true;
        if (self.mission() !== null) {
            isContinue = confirm('Все несохранненые данные будут утеряны, продолжить?');
        }
        if (isContinue) {
            var missions = self._getExistsMissions();
            self.dialog.show('loadMission', {missions: missions});
        }
    },
    
    clickShowNewMissionInterfaceButton: function() {
        var self = game.interfaces.editor;
        var isContinue = true;
        if (self.mission() !== null) {
            isContinue = confirm('Все несохранненые данные будут утеряны, продолжить?');
        }
        if (isContinue) {
            var missions = self._getExistsMissions();
            self.dialog.show('newMission', {existsMissions: missions});
        }
    },
    
    clickLoadMissionButton: function() {
        var self = game.interfaces.editor;
        var missionToLoad = $('#missionToLoadSelector').val();
        if (missionToLoad) {
            var result = self._loadMission(missionToLoad);
            if (result) {
                self.mission(result);
                if (Object.keys(self.mission().maps).length) {
                    self.map(self.mission().maps[Object.keys(self.mission().maps)[0]]);
                    self._redraggableMap();
                } else {
                    self.map(null);
                    self.location(null);
                }
                self.dialog.hide();
            }
        }
    },
    
    clickCreateNewMissionButton: function() {
        var self = game.interfaces.editor;
        var missionId = $('#newMissionIdInput').val();
        var missionName = $('#newMissionNameInput').val()
        if (self.dialog.data().existsMissions.indexOf(missionId) !== -1) {
            alert('Миссия с таким ID уже существует, смените ID миссии');
            return;
        }
        
        self.mission({
            id: missionId,
            name: missionName,
            maps: {},
            quests: {}
        }); 
        self.map(null);
        self.location(null);
        
        self.dialog.hide();
    },
    
    clickSaveMissionInterfaceButton: function() {
		var self = game.interfaces.editor;
        var missionId = self.mission().id;
        var result = self._saveMission(missionId, self.mission());
        if (result.success) {
            alert('Миссия сохранена');
        } else {
            alert('Произошла ошибка во время сохранения');
        }
    },
    
    selectMap: function(mapId) {
        var self = game.interfaces.editor;
        self.map(self.mission().maps[mapId]);
        self._redraggableMap();
        
        if (Object.keys(self.map().locations).length) {
            self.location(self.map().locations[Object.keys(self.map().locations)[0]]);
        }
    },
    
    changeMapInSelector: function() {
        var self = game.interfaces.editor;
        self.selectMap($('#mapSelector').val());
    },
    
    clickShowEditMapInterfaceButton: function() {
        var self = game.interfaces.editor;
        self.dialog.show('addOrEditMap', {action: 'edit'});
    },
    
    clickShowNewMapInterfaceButton: function() {
        var self = game.interfaces.editor;
        self.dialog.show('addOrEditMap', {action: 'add'});
    },
    
    clickDeleteMapButton: function() {
        var self = game.interfaces.editor;
        if (confirm('Вы уверены, что хотите удалить карту?')) {
            delete self.mission().maps[self.map().id];
            if (Object.keys(self.mission().maps).length) {
                self.map(self.mission().maps[Object.keys(self.mission().maps)[0]]);
                self._redraggableMap();
            } else {
                self.map(null);
            }
            self.mission(self.mission());
        }
    },
    
    clickCreateUpdateMapButton: function() {
        var self = game.interfaces.editor;
        
        var id = $('#mapIdInput').val();
        var name = $('#mapNameInput').val();
        var width = $('#mapWidthInput').val();
        var height = $('#mapHeightInput').val();
        
        if (!id || !name || !width || !height || !parseInt(width) || !parseInt(height)) {
            alert('Неверные данные');
            return;
        }
        
        if (self.dialog.data().action === 'edit') {
            self.map().id = id;
            self.map().name = name;
            self.map().width = width;
            self.map().height = height;
            self.map(self.map());
            self._redraggableMap();
            alert('Данные карты обновлены');
        } else {
            if (Object.keys(self.mission().maps).indexOf(id) !== -1) {
                alert('Карта с таким ID уже существует, смените карту');
            } else {
                var map = {
                    id: id,
                    name: name,
                    width: width,
                    height: height,
                    roads: [],
                    locations: {}
                };
                
                self.mission().maps[id] = map;
                self.mission(self.mission());
                self.map(self.mission().maps[id]);
                self._redraggableMap();
                $('#mapSelector').val(id);
                alert('Создана новая карта: ' + name);
            }
        }
        
        self.dialog.hide();
    },
    
    changeLocationInSelector: function() {
        var self = game.interfaces.editor;
        self.setLocation($('#locationSelector').val());
    },
    
    setLocation: function(locationId) {
        var self = game.interfaces.editor;
        self.location(self.map().locations[locationId]);
    },
    
    clickShowEditLocationInterfaceButton: function() {
        
    },
    
    clickShowNewLocationInterfaceButton: function() {
        
    },
    
    clickDeleteLocationButton: function() {
        
    },
    
    clickLocationOnMap: function(location) {
        var self = game.interfaces.editor;
        $('#locationSelector').val(location.id);
        self.location(location);
        if (self.currentTab() !== 'Locations') {
            self.currentTab('Locations');
        }
    }
};