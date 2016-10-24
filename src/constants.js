var Directions = {
  EAST : 0,
  SOUTH : 1,
  WEST : 2,
  NORTH : 3,

  COUNT : 4,
};


var PlayerProgress = {
	LipBalmFound: [false, false, false],

	MadeItPastTutorial: false
}

var ResetPlayerProgress = function () {
	PlayerProgress.LipBalmFound = [false, false, false];
	PlayerProgress.MadeItPastTutorial = false;
}

var Messages = {
	TestMessage: "hello world, this is not\nsnorlax!!!!!",
	Message1: "Lisa Blackout, I need new lip\nbalm! My face is parched!\nEnter the Potato Android temple\nand retreive all three for me!\nAre you spy a enough?",

};

var soundEffectsToLoad = ['alarm',
                          'bip',
                          'codec',
                          'exclaim',
                          'hurt',
                          'select',
                          'shoot1',
                          'shoot2',
                          'shoot3'];

var SoundBank = {};