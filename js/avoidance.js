'use strict';


class AvoidancePiece {
    constructor(board) {
        this.board = board;
        this.type = "knight";
        this.cell = null;
		this.puzzle = null;
    }



    isAt(i,j){
        return this.cell.rowNum==i && this.cell.colNum==j;
    }

    setCell(cell) {
        this.cell = cell;
        this.cell.decoration = this.type;
    }
    getCell(){
        return this.cell;
    }
    
	inNeighbors(){
		return this.puzzle.pieces.filter(p => p.pieceIsReachable(this));
	}

	//piece neighbors
	outNeighbors(){
		return this.puzzle.pieces.filter(p => this.pieceIsReachable(p));
	}

	//cell neighbors
	neighbors(){
		return this.cell.neighbors();
	}
	
    getNeighborCell(){
        let nbs = this.cell.neighbors();
        let nonEmpties = nbs.filter(n => n.decoration == "");
        console.log("found occupied neighbours: "+  nbs.filter(n => n.decoration != ""));
        return nonEmpties[Math.floor(Math.random() * nonEmpties.length)];
    }

	pieceIsReachable(piece){
		let targetCell = piece.getCell();
		return this.cellIsReachable(targetCell);
	}
    cellIsReachable(cell){
        if(!this.cell.neighbors().includes(cell)){
            return false;
        }
        let thetype = this.type;
        if(thetype==="king" | thetype==="knight"){ return true;}
        let this_row = this.cell.rowNum;
        let this_col = this.cell.colNum;
        let other_row = cell.rowNum;
        let other_col =  cell.colNum;

        if (this_row == other_row || this_col == other_col){
            console.log("- use rook positioning");
            return this.cellIsReachableRook(cell);
        }

        console.log("- use bishop positioning");
        return this.cellIsReachableBishop(cell);
    }

    cellIsReachableBishop(cell){
        let this_row = this.cell.rowNum;
        let this_col = this.cell.colNum;
        let other_row = cell.rowNum;
        let other_col =  cell.colNum;
        if (this_row < other_row){ //other is ahead in row
            if (this_col < other_col){ //other is ahead in column
                let i = this_row + 1;
                let j = this_col + 1;
                while (i < other_row && j < other_col){
                    let space = this.board.cells[i][j];
                    if (space.decoration !== "") {
                        console.log("-- found " + space.decoration + " in path");
                        return false;
                    }
                    i++;
                    j++;
                }

            } else { //other is behind on column
                let i = this_row + 1;
                let j = this_col - 1;
                while (i < other_row && j > other_col){
                    let space = this.board.cells[i][j];
                    if (space.decoration !== "") {
                        console.log("-- found " + space.decoration + " in path");
                        return false;
                    }
                    i++;
                    j--;
                }
            }
        } else {
            if (this_col < other_col){ //other is ahead in column
                let i = this_row - 1;
                let j = this_col + 1;
                while (i > other_row && j < other_col){
                    let space = this.board.cells[i][j];
                    if (space.decoration !== "") {
                        console.log("-- found " + space.decoration + " in path");
                        return false;
                    }
                    i--;
                    j++;
                }

            } else { //other is behind on column
                let i = this_row - 1;
                let j = this_col - 1;
                while (i > other_row && j > other_col){
                    let space = this.board.cells[i][j];
                    if (space.decoration !== "") {
                        console.log("-- found " + space.decoration + " in path");
                        return false;
                    }
                    i--;
                    j--;
                }
            }
        }
        return true;
    }
    cellIsReachableRook(cell){
        let this_row = this.cell.rowNum;
        let this_col = this.cell.colNum;
        let other_row = cell.rowNum;
        let other_col =  cell.colNum;

        let minRow = Math.min(this_row, other_row);
        let maxRow = Math.max(this_row, other_row);
        let minCol = Math.min(this_col, other_col);
        let maxCol = Math.max(this_col, other_col);

        if (this_row == other_row){
            for (let i = minCol + 1; i < maxCol; i++) {
               let space = this.board.cells[this_row][i];
               if (space.decoration !=""){
                   console.log("-- found " + space.decoration + " in path");
                   return false;
               }
            }
        } else if (this_col == other_col){
            for (let i = minRow + 1; i < maxRow; i++) {
                let space = this.board.cells[i][this_col];
                if (space.decoration !==""){
                    console.log("-- found " + space.decoration + " in path");
                    return false;
                }
            }
        }
        console.log("-- found nothing in rook path");
        return true;
    }
    hasEmptyNeighbors(){
        let nbs = this.reachableUnoccupiedNeighbors();
        return nbs.length > 0;
    }

    reachableUnoccupiedNeighbors(){
        return this.cell.neighbors().filter(n => (this.cellIsReachable(n) && n.decoration === ""));
    }

}

class Region {
	constructor(puzzle, startCell){
		this.puzzle = puzzle;
		this.startCell = startCell;
		this.cells = [];
		this.cells.push(startCell);
		this.exclusion = [];
	}

	candidate(){
		this.cells.filter
	}

	addToRegion(cell){
		this.cells.push(cell);
	}

	addToExclusion(cell){ 
		this.exclusion.push(cell);
	}

	
}


class PuzzleGenerator{
    constructor(board, pieceType='queen') { // initial testing is with queen
        this.board = board;
		//this.puzzle = new AvoidancePuzzle(board);
		this.pieces = [];'
		this.pieceType = pieceType;
		this.puzzle.pieceType = this.pieceType;
		this.cover =[];
		
    }

	addPiece(piece) {
		piece.puzzle = this;
        this.pieces.push(piece);
    }

	calculateCover(){
		this.cover = [];
		for (let k = 0; k < this.pieces.length; k++)  {
			let selected = this.pieces[k];
			let nbs = selected.neighbors();
			for (let l = 0; l < nbs.length; l++){
				let nbCell = nbs[l];
				let i = nbCell.rowNum;
				let j = nbCell.colNum;
				if (!this.isInSet(i,j,this.cover)){
						this.cover.push(nbCell);
				}
			}
		}

	}


	isInSet(i,j, set) {
		for (let k=0; k < set.length; k++) {
			let current = set[k];
			if (current.rowNum == i && current.colNum == j) return true;
		}
		return false;
	}

	independenceScore() {
		let score = 0;
		for(let k=0; k <this.pieces.length; k++) {
			let cell = this.pieces[k];
			if (this.isInSet(cell.rowNum, cell.colNum, this.cover)) {
				score ++;
			}
		}
		return score;
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
        let firstpiece = new AvoidancePiece(this.board);
        
		firstpiece.type = this.randomType();
		
        firstpiece.setCell(startposition);
        this.puzzle.addPiece(firstpiece);
    }
    
	existingAvoidance(){
        let op = this.puzzle.randomAvailablePiece();
        let newPiece = new AvoidancePiece(this.board);
        newPiece.type = this.randomType();
        console.log("new piece: " + newPiece.type);
        this.puzzle.addPiece(newPiece);

        let nbs = op.reachableUnoccupiedNeighbors();
        console.log("creating puzzle -- selected " + op);

        let ogCell = op.getCell();
        let newCell = nbs[Math.floor(Math.random() * nbs.length)];

        console.log("new cell is reachable: " + op.cellIsReachable(newCell));
        op.moveTo(newCell);
        newPiece.setCell(ogCell);
        this.puzzle.moves.push("the " + op.type +" at "
            + newCell.position()  + " takes " + newPiece.type +" at " + ogCell.position() );
    }

    puzzleOfDepth(depth){
        this.initialPosition();
        for(let i=0; i< depth; i++){
            this.existingAvoidance();
        }
        return this.puzzle;
    }

    //2pieces
    verySimplePuzzle(){
        return this.puzzleOfDepth(1);
    }
    //3pieces
    simplePuzzle(){
        return this.puzzleOfDepth(2);
    }
    
}
