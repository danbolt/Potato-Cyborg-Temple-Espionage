var Load = function () {
	//
};
Load.prototype.preload = function() {
  this.game.load.image('logo', 'asset/img/logo.png');

  this.game.load.spritesheet('test16x16', 'asset/img/16x16SquareSheet.png', 16, 16);
  this.game.load.image('test16x16_tile', 'asset/img/16x16SquareSheet.png');

  this.game.load.spritesheet('portraits', 'asset/img/portraits.png', 77, 92);

  this.game.load.spritesheet('sprite_sheet_16x16', 'asset/img/spriteSheet.png', 16, 16);
  this.game.load.spritesheet('sprite_sheet_16x32', 'asset/img/spriteSheet.png', 16, 32);
  this.game.load.spritesheet('sprite_sheet_32x32', 'asset/img/spriteSheet.png', 32, 32);
  this.game.load.spritesheet('sprite_sheet_128x16', 'asset/img/spriteSheet.png', 128, 16);

  this.game.load.audio('background_melody', 'asset/bgm/jealous-villages.mp3');

  soundEffectsToLoad.forEach(function (sname) {
    this.game.load.audio(sname, 'asset/sfx/' + sname + '.wav');
  }, this);

  this.game.load.tilemap('level1', 'asset/map/level1.json', undefined, Phaser.Tilemap.TILED_JSON);
};
Load.prototype.create = function() {
  this.game.bgmMelody = this.game.add.audio('background_melody', 0.8, true);
  this.game.bgmMelody.play();

	soundEffectsToLoad.forEach(function (sname) {
    SoundBank[sname] = this.game.add.audio(sname, 0.8, false);
  }, this);

 	this.game.state.start('TitleScreen');
};