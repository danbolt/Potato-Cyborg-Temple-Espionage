var GoalObject = function (game, x, y) {
  Phaser.Sprite.call(this, game, x + 8, y + 8, 'test16x16', 2);
  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.setSize(16, 16);
  this.anchor.set(0.5);
};
GoalObject.prototype = Object.create(Phaser.Sprite.prototype);
GoalObject.prototype.constructor = GoalObject;

var Gameplay = function () {
  this.player = null;
  this.guards = null;
  this.bulletPool = null;
  this.goalObjectPool = null;
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

  this.goalObjectPool = this.game.add.group();
  for (var i = 0; i < 3; i++) {
    var newGoal = new GoalObject(this.game, -1000, -1000);
    this.goalObjectPool.addChild(newGoal);
    this.goalObjectPool.addToHash(newGoal);
    newGoal.kill();
  }

  this.bulletPool = this.game.add.group();
  for (var i = 0; i < 20; i++) {
    var newBullet = new EnemyBullet(this.game, -1000, -1000, 0, this.foreground);
    this.bulletPool.addChild(newBullet);
    this.bulletPool.addToHash(newBullet);
    newBullet.kill();
  }

  this.guards = this.game.add.group();
  for (var i = 0; i < 10; i++) {
    var newGuard = new EnemyGuard(this.game, -999, -999, this.player, this.foreground, this.isEvading, this.sightedPlayer, this.bulletPool);
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

  this.guards.forEachAlive(function (g) {
    g.body.velocity.set(0, 0);
    g.startShooting();
  }, this);
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
            var matchingNode = this.map.objects.PatrolNodes.find(function (node) { return (node.name === patrolNode); }, this);
            newGuard.patrolRoute.push(matchingNode);
          }, this);
        }
      }
    }
  }, this);
};
Gameplay.prototype.spawnObjectsForRoom = function () {
  // if there is a object in the bounds of the camera, spawn it in the room
  this.map.objects.GameplayObjects.forEach(function (objectData) {
    if (!(objectData.x > (this.camera.x + this.camera.width) ||
          objectData.x < (this.camera.x) ||
          objectData.y > (this.camera.y + this.camera.height) ||
          objectData.y < (this.camera.y))) {
      
      if (objectData.name === "Goal") {
        var newGoal = this.goalObjectPool.getFirstDead();
        newGoal.revive();
        newGoal.position.set(objectData.x, objectData.y);
      }
    }
  }, this);
};
Gameplay.prototype.update = function () {
  this.game.physics.arcade.collide(this.player, this.foreground);
  this.game.physics.arcade.overlap(this.player, this.bulletPool, function (player, bullet) {
    player.kill();
    bullet.kill();

    this.game.state.start('LoseScreen');
  }, undefined, this);
  this.game.physics.arcade.overlap(this.player, this.goalObjectPool, function (player, goal) {
    goal.kill();

    this.game.state.start('WinScreen');
  }, undefined, this);
  this.game.physics.arcade.collide(this.foreground, this.bulletPool, function (bullet, foreground) {
    bullet.kill();
  }, undefined, this);

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
        this.goalObjectPool.forEachAlive(function (goal) {
          goal.kill();
        }, this);

        var cameraShuffle = this.game.add.tween(this.camera);
        var targetX = (~~(this.player.x / this.camera.width)) * this.camera.width;
        var targetY = (~~(this.player.y / this.camera.height)) * this.camera.height;
        cameraShuffle.to( { x:  targetX, y: targetY }, 500 );
        cameraShuffle.onComplete.add(function () {
          this.isScrolling = false;
          this.player.disableMovement = false;

          this.spawnGuardsForRoom();
          this.spawnObjectsForRoom();

        }, this);
        cameraShuffle.start();
    }
  }
};
/*
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
  
};*/
Gameplay.prototype.shutdown = function () {
  this.player = null;
  this.guards = [];
  this.bulletPool = null;
  this.goalObjectPool = null;
  this.ui = null;

  this.map = null;
  this.foreground = null;
};