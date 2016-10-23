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