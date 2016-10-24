var LoseScreen = function () {
	//
};
LoseScreen.prototype.create = function() {
	this.game.camera.reset();

	this.game.add.bitmapText(32, 32, 'font', 'you lose sorry :(', 8);

	this.game.time.events.add(2000, function () {
		this.game.state.start('Gameplay');
	}, this);
};

var TitleScreen = function () {
	//
};
TitleScreen.prototype.create = function() {
	this.game.camera.reset();

	var logo = this.game.add.sprite(this.game.width / 2, this.game.height / 4 + 16, 'logo');
	logo.anchor.set(0.5, 0.5);

	var instructions = this.game.add.bitmapText(this.game.width / 2, this.game.height / 2 + 16, 'font', 'arrow keys to move\n\npress space to start', 8);
	instructions.align = 'center';
	instructions.anchor.x = 0.5;

	var authorNote = this.game.add.bitmapText(0, this.game.height - 24, 'font', '(c)2016\ndaniel savage\nskybox labs inc', 8);

	var spaceKey = this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
	spaceKey.onUp.add(function () {
		SoundBank['select'].play();

		this.game.state.start('Gameplay');
	}, this);
};