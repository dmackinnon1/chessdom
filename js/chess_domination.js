'use strict';
/*
* Domination class keeps track of chess board domination and independence.
*/
class Domination {		
	constructor(board) {
		this.board = board;
		this.pieces =[];
		this.cover =[];
	}

	getBoard() {
		return this.board;
	}

	startGame() {
		gameDisplay.map = svgMap(this.occupiedCells(), this.cover, this.board.size);
		gameDisplay.score = scoreDisplay(0,this.dominationScore(), this.independenceScore()); 	
		evnts.fireEvent("refreshMap");
		evnts.fireEvent("refreshScore");
	}

	colourCells(){
		// .flat() turns the 2D grid of cells into one list
		this.board.cells.flat().forEach(cell =>
			getDiv(cell.rowNum, cell.colNum).attr("style", "color:black"));

		this.cover = [];
		this.pieces.forEach(selected => {
			selected.neighbors().forEach(nbCell => {
				if (!this.cover.includes(nbCell)){
					this.cover.push(nbCell);
					getDiv(nbCell.rowNum, nbCell.colNum).css("background","#99ff99");
				}
			});
		});
	}

	// number of squares that are neither occupied nor attacked
	dominationScore() {
		let occupied = this.occupiedCells();
		return this.board.cells.flat().filter(cell =>
			!(this.cover.includes(cell) || occupied.includes(cell))).length;
	}

	// number of pieces that are attacked by another piece
	independenceScore() {
		return this.pieces.filter(piece => this.cover.includes(piece.cell)).length;
	}

	// the cells that have a piece on them
	occupiedCells() {
		return this.pieces.map(piece => piece.cell);
	}

	// called when a square is clicked: add a piece there, or remove the one that is there
	selectCell(cell) {
		let i = cell.rowNum;
		let j = cell.colNum;
		let existing = this.pieces.find(piece => piece.cell === cell);
		if (existing) {
			this.pieces = this.pieces.filter(piece => piece !== existing);
			cell.decoration = "";
			getDiv(i, j).html(emptyCell(i,j));
		} else {
			let piece = new Piece(gameType.type);
			piece.setCell(cell);
			this.pieces.push(piece);
			getDiv(i, j).html(gameGlyph(i,j, piece.type));
		}
		this.colourCells();
		gameDisplay.map = svgMap(this.occupiedCells(), this.cover, this.board.size);
		evnts.fireEvent("refreshMap");
		gameDisplay.score = scoreDisplay(this.pieces.length, this.dominationScore(), this.independenceScore()); 
		evnts.fireEvent("refreshScore");
	}			
};

/*
{
  "name": "5 queens on 5x5",
  "size": 5,
  "cover": "true",
  "unguard": "true",
  "pieces": [
    {
      "name": "queen",
      "count": 5
    }
  ]
}
In this first version of mathematical chess puzzles,
we are assume only one piece type
*/

class Puzzle extends Domination {
	constructor(board, puzzledef) {
		super(board);
		this.puzzledef = puzzledef;
		this.number = parseInt(puzzledef.pieces[0].count)
		this.type = puzzledef.pieces[0].name
		this.size = puzzledef.size;
		this.resetStatus();
	}

	selectCell(cell){
		super.selectCell(cell);
		this.resetStatus();
		evnts.fireEvent("refreshScore");
	}

	resetStatus(){
		if (this.isSolved()){
			gameDisplay.status = "You solved the Puzzle!";
		} else {
			gameDisplay.status = "Not solved yet...";		
		}			
	}

	isSolved(){
		let solvedCover = false;
		let solvedUnguard = false;
		let solvedPieceCount = false;

		if (this.pieces.length === this.number){
			solvedPieceCount = true;
		}
		if(this.puzzledef.cover === 'true'){
			if (this.dominationScore() === 0){
				solvedCover = true;
			} else {
				solvedCover = false;
			} 
		} else {
			solvedCover = true;
		}
		if (this.puzzledef.unguard === 'true'){
			if (this.independenceScore() === 0){
				solvedUnguard = true;
			} else {
				solvedUnguard = false;
			}
		} else {
			solvedUnguard = true;
		}
		return solvedPieceCount && solvedUnguard && solvedCover;
	}

	puzzleDescription() {
		let d = "<div><h4> Your Puzzle: " + this.puzzledef.name + "</h4>";
		d += "Place " + this.number +" " + this.type +"s";
		d += " on a " + this.size + "x" + this.size + " chessboard.";
		if(this.puzzledef.cover === 'true'){
			d+= " The board must be dominated.";
		}
		if(this.puzzledef.unguard === 'true'){
			d+= " The pieces must be independent. </div>";
		}
		return d;
	}

};

function scoreDisplay(pieces, domination, independence) {
	let html = new Bldr("h4").att("align","center");
	html.text("" + pieces + " pieces have been placed.")
	html.elem(new Bldr("br"));
	if (domination == 0) {
		html.text("Board is dominated.");
		html.elem(new Bldr("br"));
	} else {
		html.text("Board not dominated (remaining squares: " + domination + ").");
		html.elem(new Bldr("br"));
	}
	if (independence == 0) {
		html.text("Set is independent.");
	} else {
		html.text("Set is not independent (" + independence + " overlaps).");
	}
	return html.build();
}

//utilities

function removeElement(array, e) {
	return array.filter(x => x !== e);
}

function randomRange(greaterThan, lessThan){
	let shifted = randomInt(lessThan - greaterThan + 1);
	return lessThan - shifted; 
};

function randomElement(array) {
	let res =randomRange(0, array.length-1);
	return array[res];
};