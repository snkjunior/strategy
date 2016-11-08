var game = {
    playerId: 1,
    
    screen: {
        width: 1024,
        height: 500
    },

    data: {},

    currentInterface: null,
    interfaces: {},
    components: {}
};

game.init = function() {
    $("#interface").css('width', game.screen.width);
    $("#interface").css('height', game.screen.height);    
   
    this.loadData();
    
    this.initTemplates();
    this.showInterface('battle', {});
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
}

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
