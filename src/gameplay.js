var Directions = {
  EAST : 0,
  SOUTH : 1,
  WEST : 2,
  NORTH : 3,

  COUNT : 4,
};

var Player = function (game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'test16x16', 3);

  this.playerWalkSpeed = 100;

  this.disableMovement = false;

  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.setSize(16, 16);
  this.anchor.set(0.5);
};
Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;
Player.prototype.update = function () {

  if (this.disableMovement === false) {
    // move the player velocity based on keyboard input
    if (this.game.input.keyboard.isDown(Phaser.KeyCode.RIGHT)) {
      this.body.velocity.x = this.playerWalkSpeed;
    } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.LEFT)) {
      this.body.velocity.x = -this.playerWalkSpeed;
    } else {
      this.body.velocity.x = 0;
    }

    if (this.game.input.keyboard.isDown(Phaser.KeyCode.DOWN)) {
      this.body.velocity.y = this.playerWalkSpeed;
    } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.UP)) {
      this.body.velocity.y = -this.playerWalkSpeed;
    } else {
      this.body.velocity.y = 0;
    }
  } else {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
  }
};


var EnemyGuard = function (game, x, y, player, foreground, isEvading, sightedPlayer) {
  Phaser.Sprite.call(this, game, x, y, 'test16x16', 5);
  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.setSize(16, 16);
  this.anchor.set(0.5);

  this.player = player;
  this.foreground = foreground;

  this.isEvading = isEvading;
  this.sightedPlayer = sightedPlayer;

  this.patrolRoute = null;
  this.currentPatrolRouteIndex = 0;
  this.events.onKilled.add(function () { this.patrolRoute = null; this.currentPatrolRouteIndex = 0; }, this);

  this.directionFacing = Directions.WEST;
  this.sightRange = 5 * 16;
  this.sightWidth = Math.PI / 2.5;

  this.walkSpeed = 100;
};
EnemyGuard.prototype = Object.create(Phaser.Sprite.prototype);
EnemyGuard.prototype.constructor = EnemyGuard;
EnemyGuard.prototype.update = function () {
  if (this.alive === false) {
    return;
  }


  if (this.isEvading() === false) {
    // check if the player is in sight
    if (this.position.distance(this.player.position, true) < this.sightRange) {
      var guardAngleA = this.directionFacing / Directions.COUNT * Math.PI * 2 + (this.sightWidth / 2);
      var guardAngleB = this.directionFacing / Directions.COUNT * Math.PI * 2 - (this.sightWidth / 2);
      var playerAngle = (Math.PI * 2 + Math.atan2( this.player.y - this.position.y, this.player.x - this.position.x )) % (Math.PI * 2);

      if (playerAngle > guardAngleB && playerAngle < guardAngleA) {

        var rayCastResult = this.foreground.getRayCastTiles(new Phaser.Line(this.x, this.y, this.player.x, this.player.y), 4, true);

        if (rayCastResult.length < 1) {
          this.sightedPlayer();
          this.body.velocity.set(0, 0);
        }
      }
    }

    // follow our patrol route, if we have one
    if (this.patrolRoute !== null && this.isEvading() === false) {
      var currentPatrolNode = this.patrolRoute[this.currentPatrolRouteIndex];

      if (this.position.distance(new Phaser.Point( currentPatrolNode.x, currentPatrolNode.y)) < 3) {
        this.currentPatrolRouteIndex = (this.currentPatrolRouteIndex + 1) % this.patrolRoute.length;
      }
      var nextPatrolAngle = Math.atan2(currentPatrolNode.y - this.y, currentPatrolNode.x - this.x);
      this.body.velocity = new Phaser.Point(this.walkSpeed * Math.cos(nextPatrolAngle), this.walkSpeed * Math.sin(nextPatrolAngle));
      this.directionFacing =  ~~((((nextPatrolAngle + (Math.PI * 2)) % (Math.PI * 2) ) / (Math.PI * 2)) * Directions.COUNT);
    }
  }
};

var Gameplay = function () {
  this.player = null;
  this.guards = null;
  this.ui = null;

  this.isScrolling = false;

  this.evading = false;

  this.map = null;
  this.foreground = null;
};
Gameplay.prototype.init = function() {
  //
};
Gameplay.prototype.preload = function() {
  //
};
Gameplay.prototype.create = function() {
  // closure context
  var that = this;

  // stealth game logic
  this.evading = false;
  this.isEvading = function () { return that.evading; };
  this.sightedPlayer = function () {
    that.playerSighted();
  };

  // create map
  this.map = this.game.add.tilemap('level1');
  this.map.addTilesetImage('sheet', 'test16x16_tile');
  this.map.setCollisionByExclusion([0]);
  this.foreground = this.map.createLayer('Foreground');

  // enable collision detections with map
  this.game.physics.enable(this.foreground, Phaser.Physics.ARCADE);

  this.ui = this.game.add.group();
  this.ui.sneakLabel = this.ui.addChild(this.game.add.bitmapText(32, 32, 'font', 'test', 8));
  this.ui.fixedToCamera = true;
  this.playerSnuckAway();

  this.player = new Player(this.game, 64, 64);
  this.game.add.existing(this.player);

  this.guards = this.game.add.group();

  // add some dummy guards
  for (var i = 0; i < 10; i++) {
    var newGuard = new EnemyGuard(this.game, -999, -999, this.player, this.foreground, this.isEvading, this.sightedPlayer);
    this.game.add.existing(newGuard);
    this.guards.addChild(newGuard);
    newGuard.kill();
  }
  this.spawnGuardsForRoom();

  // setup camera scrolling
  this.isScrolling = false;
  this.camera.roundPx = true;
  this.camera.bounds = null;

  this.game.world.bringToTop(this.ui);
};
Gameplay.prototype.playerSighted = function () {
  this.evading = true;
  this.ui.sneakLabel.text = 'watch out!';
};
Gameplay.prototype.playerSnuckAway = function () {
  this.evading = false;
  this.ui.sneakLabel.text = 'sneaking!';
};
Gameplay.prototype.spawnGuardsForRoom = function () {
  // if there is a guard in the bounds of the camera, spawn it in the room
  this.map.objects.Guards.forEach(function (guardData) {
    if (!(guardData.x > (this.camera.x + this.camera.width) ||
          guardData.x < (this.camera.x) ||
          guardData.y > (this.camera.y + this.camera.height) ||
          guardData.y < (this.camera.y))) {
      var newGuard = this.guards.getFirstDead();
      if (newGuard !== null) {
        newGuard.revive();

        newGuard.x = guardData.x + 8;
        newGuard.y = guardData.y + 8;
        newGuard.directionFacing = guardData.properties.direction;
        if (guardData.properties.patrol) {
          var patrolData = JSON.parse(guardData.properties.patrol);
          newGuard.patrolRoute = [];
          patrolData.forEach(function (patrolNode) {
            //newGuard.patrolRoute.push();
            var matchingNode = this.map.objects.PatrolNodes.find(function (node) { return (node.name === patrolNode); }, this);
            newGuard.patrolRoute.push(matchingNode);
          }, this);
        }
      }
    }
  }, this);
};
Gameplay.prototype.update = function () {
  this.game.physics.arcade.collide(this.player, this.foreground);

  if (this.isScrolling === false) {
    if (this.player.x > (this.camera.x + this.camera.width) ||
        this.player.x < (this.camera.x) ||
        this.player.y > (this.camera.y + this.camera.height) ||
        this.player.y < (this.camera.y)) {
      
        this.isScrolling = true;
        this.player.disableMovement = true;

        this.playerSnuckAway();
        this.guards.forEachAlive(function (guard) {
          guard.kill();
        }, this);

        var cameraShuffle = this.game.add.tween(this.camera);
        var targetX = (~~(this.player.x / this.camera.width)) * this.camera.width;
        var targetY = (~~(this.player.y / this.camera.height)) * this.camera.height;
        cameraShuffle.to( { x:  targetX, y: targetY }, 500 );
        cameraShuffle.onComplete.add(function () {
          this.isScrolling = false;
          this.player.disableMovement = false;

          this.spawnGuardsForRoom();

          // randomly put some guards in the room
          /*
          for (var i = 0; i < 3; i++) {
            var newGuard = this.guards.getFirstDead();
            if (newGuard !== null) {
              newGuard.revive();
              newGuard.directionFacing = ~~(Directions.COUNT * Math.random());
              newGuard.x = this.camera.x + (this.camera.width / 4) + (this.camera.width / 2 * Math.random());
              newGuard.y = this.camera.y + (this.camera.height / 4) + (this.camera.height / 2 * Math.random());
            }
          } */

        }, this);
        cameraShuffle.start();
    }
  }
};
Gameplay.prototype.render = function () {
  this.guards.forEachAlive(function (guard) {
    var guardAngleA = guard.directionFacing / Directions.COUNT * Math.PI * 2 + (guard.sightWidth / 2);
    var guardAngleB = guard.directionFacing / Directions.COUNT * Math.PI * 2 - (guard.sightWidth / 2);
    var playerAngle = Math.atan2( this.player.y - guard.position.y, this.player.x - guard.position.x );

    this.game.debug.geom(new Phaser.Circle(guard.x, guard.y, guard.sightRange * 2), 'white', false);
    this.game.debug.geom(new Phaser.Line(guard.x, guard.y, guard.x + (Math.cos(guardAngleA) * guard.sightRange), guard.y + (Math.sin(guardAngleA) * guard.sightRange)), 'red');
    this.game.debug.geom(new Phaser.Line(guard.x, guard.y, guard.x + (Math.cos(guardAngleB) * guard.sightRange), guard.y + (Math.sin(guardAngleB) * guard.sightRange)), 'red');
    this.game.debug.geom(new Phaser.Line(guard.x, guard.y, guard.x + (Math.cos(playerAngle) * guard.sightRange), guard.y + (Math.sin(playerAngle) * guard.sightRange)), 'blue');
  }, this);
  
};
Gameplay.prototype.shutdown = function () {
  this.player = null;
  this.guards = [];
  this.ui = null;

  this.map = null;
  this.foreground = null;
};