game.components.botVI = {
    getLocationToMove: function(unit, units, map) {
        var locationsToMove = [];
        var unitMoveZone = self.getSquadMoveZone(unit);

        for (var i = 0; i < unitMoveZone.length; i++) {
            var hex = unitMoveZone[i];
            if (hex.distance === game.data.units[unit.unitTypeId].speed) {
                var neighborHexes = game.components.hexGeom.getNeighborHexes(hex.x, hex.y, self.map);
                for (var j = 0; j < neighborHexes.length; j++) {
                    var unitIdInLocation = self.getUnitIdInHex(neighborHexes[j].x, neighborHexes[j].y);
                    if (unitIdInLocation) {
                        if (self.units[unitIdInLocation]().ownerId !== self.currentPlayerTurn()) {
                            if (locationsToMove.indexOf(self.map[hex.y][hex.x]) === -1) {
                                locationsToMove.push(self.map[hex.y][hex.x]);
                            }
                            break;
                        }
                    }
                }
            }
        }
        
        return locationsToMove;
    }
};


