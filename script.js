var playerMove = prompt('Would you like X or O?').toUpperCase();

var computerMove;

if (playerMove == 'X') {
	computerMove = 'O';
} else if (playerMove == 'O') {
	computerMove = 'X';
} else {
	alert('Invalid entry, you will be O.');
	playerMove = 'O';
	computerMove = 'X';
}

var emptyBoxes = document.getElementsByClassName("empty");

var gameRep = [
	null, null, null,
	null, null, null,
	null, null, null];

function clickEmptyBox() {
	var boxNum = this.id;
	this.innerHTML = gameRep[boxNum] = playerMove;
	// have computer make move
	this.removeEventListener('click', clickEmptyBox);
	console.log(gameRep);
}

function findBestMove() {
	//choose optimal move for computer
	
}

for (i = 0; i < emptyBoxes.length; i++) {
	emptyBoxes[i].addEventListener('click', clickEmptyBox);
}
