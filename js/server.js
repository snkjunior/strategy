game.server = {
    main: {
        socket: null,
        ip: "127.0.0.11",
        port: 8080,
        
        events: {
            auth: null
        }
    },
    
    mission: {
        socket: null,
        ip: null,
        port: null,
        
        mId: null,
        authKey: null,
        
        events: {
            initMission: null,
            startBattle: null,
            newTurn: null,
            test: null
        }
    }
};

game.server.init = function() {
    this.loadEvents("main");
    this.loadEvents("mission");
    
    //this.connectToMainServer();
};

game.server.loadEvents = function(serverType) {
    for (var eventName in this[serverType].events) {
        var script = document.createElement("script");
        script.src = "/js/serverEvents/" + serverType + "/" + eventName + ".js?" + new Date().getTime();
        document.getElementsByTagName('head')[0].appendChild(script);
    }
};

game.server.connectToMainServer = function() {
    var socket = io.connect(this.main.ip + ":" + this.main.port);
    if (!socket) 
        return "Can't connect";
    
    socket.on("connect", function() {
        game.server.bindEventsToSocket(socket, "main");
    });
    
    this.main.socket = socket;
    
    return true;
};

game.server.connectToMissionServer = function(ip, port, mId, authKey) {
    var socket = io.connect(ip + ":" + port);
    if (!socket) 
        return "Can't connect";

    socket.on("connect", function() {
        game.server.bindEventsToSocket(socket, "mission");
        socket.emit("auth", {
           playerId: game.playerId,
           mId: mId,
           authKey: authKey
        });
    });
    
    this.mission.ip = ip;
    this.mission.port = port;    
    this.mission.socket = socket;
    
    this.mission.mId = mId;
    this.mission.authKey = authKey;
    
    return true;
};

game.server.bindEventsToSocket = function(socket, serverType) {
    for (var eventName in this[serverType].events) {
        socket.on(eventName, game.server[serverType].events[eventName]);
    }
};

game.server.sendMessage = function(serverType, event, data) {
    this[serverType].socket.emit(event, data);
};

