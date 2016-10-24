var LoseScreen = function () {
	//
};
LoseScreen.prototype.create = function() {
	this.game.camera.reset();

	var loseText = this.game.add.bitmapText(this.game.width / 2, this.game.height / 2, 'font', 'Lisa! You died!\n\n\nWant to give it another go?\n\n\nPress space to retry.\n\nPress Backspace to return to title.', 8);
	loseText.align = 'center';
	loseText.anchor.set(0.5, 0.5);


	this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR).onUp.add(function () {
		SoundBank['select'].play();
		this.game.state.start('Gameplay');
	}, this);

	this.game.input.keyboard.addKey(Phaser.KeyCode.BACKSPACE).onUp.add(function () {
		SoundBank['select'].play();
		this.game.state.start('TitleScreen');
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