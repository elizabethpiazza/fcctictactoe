/* jQuery Tiny Pub/Sub - v0.7 - 10/27/2011
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT, GPL */

(function($) {

  var o = $({});

  $.subscribe = function() {
    o.on.apply(o, arguments);
  };

  $.unsubscribe = function() {
    o.off.apply(o, arguments);
  };

  $.publish = function() {
    o.trigger.apply(o, arguments);
  };

}(jQuery));


/* Tic tac toe implementation below
 * heavily based on 
 * http://mamallamacoding.blogspot.com/2014/03/making-tictactoe-with-object-oriented.html
 */

function Square (value) {
	"use strict";

	var value,
			marked = false;

	this.value = value;

	Object.defineProperty(this, "squareMarked", {
		get: function(){ return marked; },
		set: function(mark) { marked = mark; }
	});

	Object.defineProperty(this, "squareValue", {
		get: function(){ return value; }
	});

	this.setOccupied = function(){
		this.marked = true;
	}

	this.setEmpty = function(){
		this.marked = false;
	}

	this.isEmpty = function(){
		return !this.marked;
	};

}

function Board () {
	"use strict";

	var squares = new Array(),
			SIZE = 3;

	this.addSquares = function() {
		for (var i = 0; i < (SIZE * SIZE); i++){
			squares[i] = new Square(Math.pow(2, i));
		}
	};

	this.addSquares();

	Object.defineProperty(this, "squaresArray", {
		get: function() { return squares; }
	});

	this.setSquareOccupied = function(squareIndex) {
		squares[squareIndex].setOccupied();
	};

	this.resetSquares = function() {
		for (var i = 0; i < squares.length; i++){
			squares[i].setEmpty();
		}
	};

	this.isSquareEmpty = function(squareIndex) {
		return squares[squareIndex].isEmpty();
	};

	this.getValue = function(squareIndex) {
		return squares[squareIndex].squareValue;
	};

	this.emptySquares = function() {
		var empty = new Array();
		for (var i = 0; i < (SIZE * SIZE); i++) {
			if (squares[i].isEmpty()) { empty.push(i); }
		}
		return empty;
	}

	this.isAllFilledIn = function() {
		for (var i = 0; i < (SIZE * SIZE); i++) {
			if(squares[i].isEmpty()) { return false; }
		}
		return true;
	}

}

function Player(symbol) {
	"use strict"

	var symbol,
			score,
			threeInARowConditions = [7, 56, 448, 73, 146, 292, 273, 84];

	this.symbol = symbol;

	Object.defineProperty(this, "playerScore", {
		get: function() { return score; },
		set: function(value) { score = value; }
	});

	Object.defineProperty(this, "playerSymbol", {
		get: function() { return symbol; }
	});

	this.isWinner = function() {
		for (var i = 0; i < threeInARowConditions.length; i++) {
			if ((threeInARowConditions[i] & score) === threeInARowConditions[i]) {
				return true;
			}
		}
		return false;
	};

	this.updateScore = function(points) {
		score += points;
	};

	this.resetScore = function() {
		score = 0;
	};
}

function Computer(symbol) {
	Player.call(this, symbol)
}

Computer.prototype = Object.create(Player.prototype);

Computer.prototype.winningCombos = {
	0: [6, 72, 272],
	1: [5, 144],
	2: [3, 288, 80],
	3: [48, 65],
	4: [40, 130, 257, 68],
	5: [24, 260],
	6: [384, 9, 20],
	7: [320, 18],
	8: [192, 36, 17]
}

Computer.prototype.tryToWin = function(emptySquares){
	for (var i = 0; i < emptySquares.length; i++){
		var combos = this.winningCombos[emptySquares[i]];
		for (var j = 0; j < combos.length; j++){
			if ((combos[j] & this.score) === combos[j]){
				return emptySquares[i];
			}
		}
	}
	return -1;
}

Computer.prototype.preventLoss = function(emptySquares, otherPlayerScore){
	for (var i = 0; i < emptySquares.length; i++){
		var combos = this.winningCombos[emptySquares[i]];
		for (var j = 0; j < combos.length; j++){
			if ((combos[j] & otherPlayerScore) === combos[j]){
				return emptySquares[i];
			}
		}
	}
	return -1;
}

function Game() {
	"use strict";

	var theBoard,
			playerX,
			playerO,
			currentPlayer,
			gameEnded;

	Object.defineProperty(this, "theCurrentPlayer", {
		get: function() { return currentPlayer; }
	});

	this.startNewGame = function() {
		theBoard = new Board();
		theBoard.resetSquares();
		playerX = new Player('X');
		playerO = new Computer('O');
		currentPlayer = playerX;
		playerX.resetScore();
		playerO.resetScore();
		gameEnded = false;
	}

	this.takeaTurn = function(squareIndex) {
		if (!gameEnded) {
			if (theBoard.isSquareEmpty(squareIndex)) {
				theBoard.setSquareOccupied(squareIndex);
				currentPlayer.updateScore(theBoard.getValue(squareIndex));
				this.publishSymbolChangedEvent();
				this.publishChangeCellSymbolEvent(squareIndex);

				if (this.isTie()) {
					setTimeout(function() { alert("Game is a tie."); }, 1);
					gameEnded = true;
				} else if (currentPlayer.isWinner()) {
					setTimeout(function() { alert("Player " + currentPlayer.playerSymbol + " won!"); }, 1);
					gameEnded = true;
				} else {
					currentPlayer == playerX ? currentPlayer = playerO : currentPlayer = playerX;
					if (currentPlayer == playerO) { this.handToComputer(); }
				}
			}
		}
	};

	this.isTie = function() {
		if (theBoard.isAllFilledIn()) {
			if (!currentPlayer.isWinner()) {
				return true;
			}
		}
		return false;
	};

	this.handToComputer = function() {
		//see if i can win
		var bestTurn = -1;
		var arrayofEmpties = theBoard.emptySquares();
		if ((bestTurn = playerO.tryToWin(arrayofEmpties)) != -1) {
			this.takeaTurn(bestTurn);
		} else if ((bestTurn = playerO.preventLoss(arrayofEmpties, playerX.playerScore)) != -1) {
			this.takeaTurn(bestTurn);
		} else {
			this.takeaTurn(arrayofEmpties[0]);
		}
	};

	this.restartGame = function() {
		location.reload();
	};

	this.publishSymbolChangedEvent = function() {
		var symbol = currentPlayer.playerSymbol;
		$.publish('symbolChangedEvent', [symbol]);
	};

	this.publishChangeCellSymbolEvent = function(index) {
		$.publish('changeCellSymbolEvent', index);
	};

	this.startNewGame();
}

$(document).ready(function Gui() {
	"use strict";

	var theID, theSymbol;

	var GRID_NAMESPACE = GRID_NAMESPACE || {};

	GRID_NAMESPACE.handleClickedOn = function() {
		var index = $(this).attr('id');
		theGame.takeaTurn(index);
	};
	GRID_NAMESPACE.handleRestartButtonClicked = function() {
		theGame.restartGame();
	};
	GRID_NAMESPACE.handleSymbolChanged = function() {
		var values = [].slice.call(arguments, 1);
		theSymbol = values[0];
	}
	GRID_NAMESPACE.handleChangeCellSymbol = function() {
		var values = [].slice.call(arguments, 1);
		theID = values[0];
		$('#' + theID).text(theSymbol);
	};
	GRID_NAMESPACE.addHandlers = function() {
		$('td').click(function() {
			GRID_NAMESPACE.handleClickedOn.call(this);
		});
		$('button').click(function() {
			GRID_NAMESPACE.handleRestartButtonClicked.call(this);
		})
	}
	GRID_NAMESPACE.subscribe = function(){
		$.subscribe('symbolChangedEvent', GRID_NAMESPACE.handleSymbolChanged);
		$.subscribe('clickedOnEvent', GRID_NAMESPACE.handleClickedOn);
		$.subscribe('changeCellSymbolEvent', GRID_NAMESPACE.handleChangeCellSymbol);
	};
	GRID_NAMESPACE.subscribe();
	GRID_NAMESPACE.addHandlers();
	var theGame = new Game();

});