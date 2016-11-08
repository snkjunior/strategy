game.components.hexGeom = {
    hexSize: 64,
    
    getNeighborHexes: function(x, y, hexMap) {
        return this.getHexesInRadius(x, y, 1, hexMap);
    },
    
    // Calculated in cartesian coordinate system
    getHexesInRadius: function(x, y, radius, hexMap) {
        var cHexCoord = hexMap[y][x].cCoord;
        var hexesInRadius = [];
        
        var fromX = x - radius < 0 ? 0 : x - radius;
        var toX = x + radius >= hexMap[0].length ? hexMap[0].length - 1 : x + radius;
        var fromY = y - radius < 0 ? 0 : y - radius;
        var toY = y + radius >= hexMap.length ? hexMap.length - 1 : y + radius;
        
        var maxDistance = radius * 4 + 1;
        
        for (var dy = fromY; dy <= toY; dy++) {
            for (var dx = fromX; dx <= toX; dx++) {
                if (dx == x && dy == y) {
                    continue;
                }
                var curHexCCoord = hexMap[dy][dx].cCoord;
                var distance = Math.sqrt(Math.pow(cHexCoord.x - curHexCCoord.x, 2) + Math.pow(cHexCoord.y - curHexCCoord.y, 2));
                if (distance <= maxDistance) {
                    hexesInRadius.push(hexMap[dy][dx]);
                }
            }
        }
        return hexesInRadius;
    },
    
    getHexesBetweenRadiuses: function(x, y, fromRadius, toRadius, hexMap) {
        var hexesInMaxRadius = this.getHexesInRadius(x, y, toRadius, hexMap);
        var hexesInMinRadius = this.getHexesInRadius(x, y, fromRadius - 1, hexMap);
        for (var i = 0; i < hexesInMinRadius.length; i++) {
            hexesInMaxRadius.splice(hexesInMaxRadius.indexOf(hexesInMinRadius[i]), 1);
        }
        return hexesInMaxRadius;
    },
    
    // Screen coordinates
    getHexCentralCoordinates: function(hex) {
        var screenDX = (game.screen.width - parseInt($('#map').css('width'))) / 2;
        var cameraDX = 0;
        if (screenDX < 0) {
            screenDX = 0;
            cameraDX = $('#map').css('left') == 'auto' ? 0 : parseInt($('#map').css('left'));
        }
        
        var screenDY = (game.screen.height - parseInt($('#map').css('height'))) / 2;
        var cameraDY = 0;
        if (screenDY < 0) {
            screenDY = 0;
            cameraDY = $('#map').css('top') == 'auto' ? 0 : parseInt($('#map').css('top'));
        }
        
        return {
            x: screenDX + hex.x * (this.hexSize - this.hexSize / 4) + this.hexSize / 2 + cameraDX,
            y: screenDY + (hex.x % 2 === 0 ? this.hexSize / 2 : 0) + hex.y * this.hexSize + this.hexSize / 2 + cameraDY
        };
    },
    
    getHexCasterianCoord: function(hex) {
        return {
            x: 2 + 3 * hex.x,
            y: 2 + 4 * hex.y + (hex.x % 2 == 0 ? 2 : 0)
        };
    },
    
    getUnitMoveZone: function(unit, battle) {
        var checkedHexes = {};
        var hexesToCheck = {};
        hexesToCheck[unit.x() + 'x' + unit.y()] = {
            x: unit.x(),
            y: unit.y(),
            distance: 0,
            prevHex: null,
            isNearEnemy: false
        };
        
        var addToRecheckList = function(list, hex, distance, prevHex) {
             if (list[hex[i].x + 'x' + hex[i].y] == null) {
                list[hex[i].x + 'x' + hex[i].y] = {
                    x: hex[i].x,
                    y: hex[i].y,
                    distance: distance,
                    prevHex: prevHex,
                    isNearEnemy: false
                };
            }
            else {
                if (list[hex[i].x + 'x' + hex[i].y].distance > distance) {
                    list[hex[i].x + 'x' + hex[i].y].distance = distance;
                    list[hex[i].x + 'x' + hex[i].y].prevHex = prevHex;
                }
            }
            return list;
        };
        
        while (Object.keys(hexesToCheck).length !== 0) {
            var recheckHexesList = {};
            for (var hexId in hexesToCheck) {
                var currentHex = hexesToCheck[hexId];
                var neighborHexes = this.getNeighborHexes(currentHex.x, currentHex.y, battle.map);
                
                for (var i = 0; i < neighborHexes.length; i++) {
                    var unitId = battle.getUnitIdInHex(neighborHexes[i].x, neighborHexes[i].y);
                    if (unitId !== null && battle.units[unitId].ownerId !== unit.ownerId) {
                        if (currentHex.x != unit.x() || currentHex.y != unit.y()) {
                            currentHex.distance = game.data.units[unit.unitTypeId].speed;
                            currentHex.isNearEnemy = true;
                        }
                    }
                }
                
                for (var i = 0; i < neighborHexes.length; i++) {
                    var distanceToNeighborHex = currentHex.distance + game.data.battle.terrains[neighborHexes[i].terrain].moves * (neighborHexes[i].object != null ? game.data.battle.objects[neighborHexes[i].object].moveMod : 1);
                    if (distanceToNeighborHex <= game.data.units[unit.unitTypeId].speed) {
                        if (battle.getUnitIdInHex(neighborHexes[i].x, neighborHexes[i].y) === null) {
                            if (checkedHexes[neighborHexes[i].x + 'x' + neighborHexes[i].y] != null) {
                                if (checkedHexes[neighborHexes[i].x + 'x' + neighborHexes[i].y].distance > distanceToNeighborHex && !checkedHexes[neighborHexes[i].x + 'x' + neighborHexes[i].y].isNearEnemy) {
                                    addToRecheckList(recheckHexesList, neighborHexes, distanceToNeighborHex, currentHex);
                                    delete checkedHexes[neighborHexes[i].x + 'x' + neighborHexes[i].y];
                                }
                            }
                            else {
                                if (hexesToCheck[neighborHexes[i].x + 'x' + neighborHexes[i].y] != null) {
                                    if (hexesToCheck[neighborHexes[i].x + 'x' + neighborHexes[i].y].distance > distanceToNeighborHex && !hexesToCheck[neighborHexes[i].x + 'x' + neighborHexes[i].y].isNearEnemy) {
                                        addToRecheckList(recheckHexesList, neighborHexes, distanceToNeighborHex, currentHex);
                                        delete hexesToCheck[neighborHexes[i].x + 'x' + neighborHexes[i].y];
                                    }
                                }
                                else {
                                    addToRecheckList(recheckHexesList, neighborHexes, distanceToNeighborHex, currentHex);
                                }
                            }
                        }
                    } 
                }
                checkedHexes[currentHex.x + 'x' + currentHex.y] = currentHex;
                delete hexesToCheck[currentHex.x + 'x' + currentHex.y];
            }
            hexesToCheck = recheckHexesList;
        }
        
        return Object.keys(checkedHexes).map(function(key) {return checkedHexes[key]});
    },
    
    getMovePass: function(moveZone, toHex) {
        if (toHex == null) {
            return [];
        }
        
        var movePass = [];
        for (var i = 0; i < moveZone.length; i++) {
            if (moveZone[i].x == toHex.x && moveZone[i].y == toHex.y) {
                var curHex = moveZone[i];
                while(curHex.prevHex != null) {
                    movePass.push({
                        hex: curHex,
                        vector: {
                            x: curHex.prevHex.x - curHex.x,
                            y: curHex.prevHex.y - curHex.y == 0 ? (curHex.x > curHex.prevHex.x && curHex.x % 2 == 1 ? 1 : -1) : curHex.prevHex.y - curHex.y
                        }
                    });
                    movePass.push({
                        hex: curHex.prevHex,
                        vector: {
                            x: curHex.x - curHex.prevHex.x,
                            y: curHex.y - curHex.prevHex.y == 0 ? (curHex.x > curHex.prevHex.x && curHex.prevHex.x % 2 == 1 ? 1 : -1) : curHex.y - curHex.prevHex.y
                        }
                    });
                    curHex = curHex.prevHex;
                }
                break;
            }
        }
        
        return movePass;
    },
    
    isHexInMoveZone: function(moveZone, x, y) {
        if (moveZone.length) {
            for (var i = 0; i < moveZone.length; i++) {
                if (moveZone[i].x == x && moveZone[i].y == y) {
                    return true;
                }
            }
        }
        return false;
    },
    
    getUnitFullAttackZone: function(unit, map) {
        
    }
};


