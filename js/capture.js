'use strict';

class CapturePuzzle {
    constructor(board) {
        this.board = board;
        this.moves = [];
        this.pieces=[];
        this.selected = null;
        this.target = null;
		this.message = "Choose a piece.";
		this.includeKing = true;
		this.moveStack = [];
    }

	resetPieceCounts(){
		this.pieces.forEach(piece => piece.count = 0);
	}
    addPiece(piece) {
		piece.puzzle = this;
        this.pieces.push(piece);
    }
    piecesWithMovesAndSpace(){
        return this.pieces.filter(piece => piece.canMoveAndHasSpace());
    }
	capture(source, target){
		this.pieces = this.pieces.filter(p => p !== target);
		let div = getDiv(source.cell.rowNum, source.cell.colNum);
		div.html(emptyCell(source.cell.rowNum,source.cell.colNum));
        source.cell.decoration = "";
        target.cell.decoration = "";
		let ogCell = source.cell;
		source.setCell(target.cell);
		source.count++;
		this.selected = null;
		this.moveStack.push(new PuzzleMove(this, source, target,ogCell))
	}

	canUndo(){
		return this.moveStack.length !=0 && !this.checkForSolved();
	}
	undoLastMove(){
		if (!this.canUndo()){
			return;
		}
		let move = this.moveStack.pop();
		move.reverseMove();
		this.colourCells();
		this.message = "Choose a piece";
		this.selected = null;
		this.colourCells();
		evnts.fireEvent("refreshMessage");
	}

    getCell(i, j) {
		return this.board.cells[i][j];
	}
    clicked(i,j, target){
        let cell = this.getCell(i,j);
		this.selectCell(cell, target);
    }

	checkForSolved(){
		return this.pieces.length == 1;
	}

	checkForStuck(){
		let isStuck = false;
		let stuckReasons = [];
		let stuckMessage = "You may be stuck";
		const hasMoves =  this.pieces.filter((p) => p.count < 2);
		const totalMoves = this.pieces.reduce((sum, p) => sum + (2 - p.count), 0);
		const totalPieces = this.pieces.length;
		const king = this.pieces.find((p) => p.type == 'king');
		const isolated = this.pieces.filter((p) => (p.inNeighbors().length == 0) && (p.outNeighbors().length == 0));
		const paralized = this.pieces.filter((p) => (p.count == 2) && (p.inNeighbors().length == 0));
		const twoMovers = this.pieces.filter((p) => p.count ==0);
		

		if (this.includeKing){
			if ((king.count ==2) && (this.pieces.length > 1)){
				isStuck = true;
				stuckReasons.push("king is out of moves");
			}
			if (king.outNeighbors().length == 0){
				isStuck = true;
				stuckReasons.push("king cannot capture");
			}
		}

		if (this.pieces.length == 2 && king == null){
			const p1 = this.pieces[0];
			const p2 = this.pieces[1];
			if ((!p1.pieceIsReachable(p2)) && (!p2.cellIsReachable(p1))){
				isStuck = true;
				stuckReasons.push("no final move available");
			}
		}
		
		if (totalMoves < this.pieces.length -1){
			isStuck = true;
			stuckReasons.push("not enough moves left to capture pieces");
		}

		if (hasMoves.length == 0){
			isStuck = true;
			stuckReasons.push("all pieces are out of moves");
		} else {
			if (paralized.length != 0 && twoMovers.length == 0){
				isStuck = true;
				stuckReasons.push("there is a piece with no moves that can't be captured");
			}
		}	

		if (isolated.length == totalPieces){
			isStuck = true;
			stuckReasons.push("all pieces are isolated");
		} else {
			if (isolated.length != 0 && twoMovers.length == 0){
				isStuck = true;
				stuckReasons.push("there is an isolated piece");
			}
		}

		if(isStuck){
			this.message = stuckMessage + ": " + joinWithAnd(stuckReasons) + ".";
		}
	}

    selectCell(cell, target) {
		let i = parseInt(target.getAttribute("data-row"));
		let j = parseInt(target.getAttribute("data-col"));
		let targetCell = this.board.cells[i][j];

		let clickedOn =this.getCapturePiece(i,j);
		if (this.selected == null && clickedOn!=null){
			this.selected = clickedOn;
            if (this.selected.remainingMoves() === 1){
                this.message = "You selected a " + clickedOn.type + " with only one move left.";
            } else {
                this.message = "You selected a " + clickedOn.type + " with " + this.selected.remainingMoves() + " moves left.";
            }
        } else if (this.selected == clickedOn){
			// same piece clicked again: keep it selected
		} else if(clickedOn == null) {
			this.selected = null;
			this.message = "No piece is slelected, please choose a piece.";
		} else if(this.selected.pieceIsReachable(clickedOn)) {
			if (this.selected.remainingMoves() == 0) {
                this.message = "No moves left for this piece.";
                this.selected = null;
            } else if (clickedOn.type == "king"){
				this.message = "You cannot capture the king.";
				this.selected = null;
			} else {
				this.message = "The " + this.selected.type + " captures the " + clickedOn.type +".";
				this.capture(this.selected,clickedOn);
			}
		} else{ 
			this.message = "This " + clickedOn.type + " is not reachable by selected " + this.selected.type;
			this.selected = null;
		}

		if(this.checkForSolved()){
			this.message = "You solved the puzzle!";
		} else {
			this.checkForStuck();
		}
		this.colourCells();
		evnts.fireEvent("refreshMessage");
		
		
	}

    getCapturePiece(i, j) {
        // find() returns undefined when nothing matches; callers expect null
        return this.pieces.find(p => p.isAt(i,j)) ?? null;
    }

    solutionHTML(){
        // moves are recorded while building the puzzle backwards, so show them in reverse.
        // [...this.moves] copies the list first: reverse() on its own would change this.moves itself
        let items = [...this.moves].reverse().map(move => "<li>" + move + "</li>\n");
        return "<ol>\n" + items.join("") + "</ol>\n";
    }

	messageHTML(){
		return this.message;
	}

    randomAvailablePiece(){
        let available = this.piecesWithMovesAndSpace();
        return available[Math.floor(Math.random() * available.length)];
    }

    colourCells() {
        this.board.cells.flat().forEach(cell => {
            let div = getDiv(cell.rowNum, cell.colNum);
            div.attr("style", "color:black");
            if (cell.decoration !=""){
                div.html(gameGlyph(cell.rowNum, cell.colNum, cell.decoration));
            }
        });

        if (this.selected != null){
            let si = this.selected.cell.rowNum;
            let sj= this.selected.cell.colNum;
            let sdiv = getDiv(si, sj);
            if (this.selected.remainingMoves() == 0) {
                sdiv.css("background","rgb(128,128,128,1)");
            } else if (this.selected.remainingMoves() == 1) {
                sdiv.css("background","rgb(128,128,128,0.5)");
            }else if(this.selected.remainingMoves() == 2){
                sdiv.css("background","rgb(128,128,128,0.2)");
            }


            // highlight the pieces the selected piece can capture
            this.selected.neighbors()
                .filter(nbCell => this.selected.cellIsReachable(nbCell) && nbCell.decoration !== "")
                .forEach(nbCell => getDiv(nbCell.rowNum, nbCell.colNum).css("background","#99ff99"));
        }
    }
}

// ["a"] -> "a",  ["a", "b"] -> "a and b",  ["a", "b", "c"] -> "a, b and c"
function joinWithAnd(items) {
	if (items.length <= 1) return items.join("");
	return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
}

// a Piece that also counts its captures (each piece may capture at most twice)
// and knows which puzzle it belongs to, so it can look at the other pieces
class CapturePiece extends Piece {
    constructor(type) {
        super(type);
        this.count = 0;
		this.puzzle = null;
    }

    remainingMoves(){
        return 2 - this.count;
    }

    moveTo(target){
        this.cell.decoration="";
        this.count ++;
        this.setCell(target);
    }
    canMove(){
        return this.count < 2;
    }

    canMoveAndHasSpace(){
        return this.canMove() && this.hasEmptyNeighbors();
    }

	inNeighbors(){
		return this.puzzle.pieces.filter(p => p.pieceIsReachable(this));
	}

	//piece neighbors
	outNeighbors(){
		return this.puzzle.pieces.filter(p => this.pieceIsReachable(p));
	}

	pieceIsReachable(piece){
		let targetCell = piece.getCell();
		return this.cellIsReachable(targetCell);
	}
    cellIsReachable(cell){
        if(!this.neighbors().includes(cell)){
            return false;
        }
        // kings and knights jump, so nothing can block them
        if (this.type === "king" || this.type === "knight") { return true; }
        // rooks, bishops and queens are blocked by any piece in between
        return this.squaresBetween(cell).every(square => square.decoration === "");
    }

    // the squares strictly between this piece and a cell on the same row, column or diagonal
    squaresBetween(cell){
        let di = Math.sign(cell.rowNum - this.cell.rowNum);
        let dj = Math.sign(cell.colNum - this.cell.colNum);
        let line = this.cell.ray(di, dj);
        return line.slice(0, line.indexOf(cell));
    }
    hasEmptyNeighbors(){
        let nbs = this.reachableUnoccupiedNeighbors();
        return nbs.length > 0;
    }

    reachableUnoccupiedNeighbors(){
        return this.neighbors().filter(n => (this.cellIsReachable(n) && n.decoration === ""));
    }

}

class PuzzleMove{
	constructor(puzzle, activePiece, targetPiece, startCell){
		this.puzzle = puzzle;
		this.activePiece = activePiece;
		this.targetPiece = targetPiece;
		this.startCell = startCell;
	}

	reverseMove(){
		this.activePiece.count--;
		this.targetPiece.setCell(this.activePiece.cell);
		this.activePiece.setCell(this.startCell);
		this.puzzle.addPiece(this.targetPiece);
	}
}

class PuzzleGenerator{
    constructor(board, kings=true, pieceType='all') {
        this.board = board;
		this.includeKing = kings ;
        this.puzzle = new CapturePuzzle(board);
		this.puzzle.includeKing = this.includeKing;
		this.pieceType = pieceType;
		
    }

    randomType(){
		if (this.pieceType == 'all'){
	        let types = ["knight","bishop","rook","queen"];
	        return types[Math.floor(Math.random() * types.length)];
		} else {
			return this.pieceType;
		}
    }
    initialPosition(){
        let startposition = this.board.randomStart();
        let firstpiece = new CapturePiece(this.includeKing ? "king" : this.randomType());
        firstpiece.setCell(startposition);
        this.puzzle.addPiece(firstpiece);
    }
    existingCapture(){
        let op = this.puzzle.randomAvailablePiece();
        let newPiece = new CapturePiece(this.randomType());
        this.puzzle.addPiece(newPiece);

        let nbs = op.reachableUnoccupiedNeighbors();

        let ogCell = op.getCell();
        let newCell = nbs[Math.floor(Math.random() * nbs.length)];

        op.moveTo(newCell);
        newPiece.setCell(ogCell);
        this.puzzle.moves.push("the " + op.type +" at "
            + newCell.position()  + " takes " + newPiece.type +" at " + ogCell.position() );
    }

    puzzleOfDepth(depth){
        this.initialPosition();
        range(depth).forEach(() => this.existingCapture());
        return this.puzzle;
    }
}
