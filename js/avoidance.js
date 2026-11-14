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

class PuzzleDescriptorPosition {
	constructor(i,j){
		this.row = i;
		this.col = j;
	}
}

class PuzzleDescriptor {
	constructor(type, description){
		this.type = type;
		this.description = description;
		this.cells = [];
	}

	addCell(i,j){
		this.cells.push(new PuzzleDescriptorPosition(i,j));
	}

	addDiagonal(){
		this.addCell(0,0);
		this.addCell(1,1);
		this.addCell(2,2);
		this.addCell(3,3);
		this.addCell(4,4);
		this.addCell(5,5);
		this.addCell(6,6);
		this.addCell(7,7);
		
	}
}

// Descriptor -> RegionCalculator -> Puzzle

class AvoidancePuzzle {
	constructor(board, descriptor){
		this.board = board;
		this.descriptor = descriptor;
		this.regionCalculator = null;
		this.cover = [];
		this.pieces = [];
		this.message = "Not solved yet.";
	}

	init(){
		this.message = "Not solved yet.";
		let initialSet = [];
		this.removePieces();
		for (let i = 0; i< this.descriptor.cells.length; i++){
			let cell = this.descriptor.cells[i];
			initialSet.push(
				this.board.cells[cell.row][cell.col]);			
		}

		console.log(initialSet)
		this.regionCalculator = new RegionCalculator(this.board, initialSet);
		this.regionCalculator.init();
		this.regionCalculator.calculate();
		evnts.fireEvent("refreshMessage");
	}

	removePieces(){
		for(let i=0; i< this.pieces.length; i++){
			this.pieces[i].getCell().decoration = "";
		}
		this.pieces = [];
	}

	messageHTML(){
		return this.message;
	}

	descriptionHTML(){
		return "Place " + this.regionCalculator.regions.length + " independent " + this.descriptor.type + "s, one in each coloured region of the board.";
	}
	colourCells(){
		this.regionCalculator.colourCells();
	}

	 getCell(i, j) {
		return this.board.cells[i][j];
	}
    clicked(i,j, target){
        console.log("received click event: " + i +"," +j+ ": "+ target);
        let cell = this.getCell(i,j);
		this.selectCell(cell, target);
    }

	getRegionID(i,j){
		let regions = this.regionCalculator.regions;
		for (let k = 0; k<regions.length; k++){
			if (regions[k].hasCell(i,j)){
				return k;
			}
		}
		return -1; //error
	}

	getRegionByID(id){
		let regions = this.regionCalculator.regions;
		return regions[id];
	}
	
	 selectCell(cell, target) {

		if (this.isSolved()) {
			return;
		} 
		 
		let i = parseInt(target.getAttribute("data-row"));
		let j = parseInt(target.getAttribute("data-col"));
		let targetCell = this.board.cells[i][j];

		//1. Get the Region for the cell
		let regionId =  this.getRegionID(i,j);
        console.log("clicked on region: " + regionId);

		let region = this.getRegionByID(regionId);
		console.log("region: " + region)
		
		console.log("has existing piece: " + region.hasExistingPiece());
		//2. If the region has an piece remove it
		if (region.hasExistingPiece()) {
			let oldCell = region.getExistingPieceCell();
			let oldPiece = this.getPiece(oldCell.rowNum, oldCell.colNum);
			this.pieces = this.pieces.filter(p => p !== oldPiece); 
			region.removeExistingPieces();
		}
		//3. Place a piece in the cell
		
		let piece = new AvoidancePiece(this);
		this.pieces.push(piece);
		piece.setCell(targetCell);
		this.colourCells();

		//highlight problems
		this.calculateCover();

		let newCell = piece.getCell();

		//if(this.cellInCellSet(newCell, this.cover)){
		//	let div = getDiv(newCell.rowNum, newCell.colNum);
        //        div.css("color","#FF0000");
		//}
		this.checkAllInCover();
		//4. Check for finished.
		if (this.isSolved()){
			this.message = "Solved!";
		} else {
			this.message = "Not solved yet. You've placed "+this.pieces.length 
				+ " of " + this.regionCalculator.regions.length + " pieces. There are " + this.coverCount() + " pieces that can be captured by another piece.";
		}
		evnts.fireEvent("refreshMessage");
		 
	}

	isSolved(){
		if (this.pieces.length != this.regionCalculator.regions.length){
			return false;
		}
		if (this.coverCount() != 0){
			return false;
		}
		return true;
	}
	
	colourInCover(p){
		let div = getDiv(p.getCell().rowNum, p.getCell().colNum);
        div.css("color","#FF0000");
	}

	checkAllInCover(){
		for (let k = 0; k< this.pieces.length; k++){
			let piece = this.pieces[k];
			let cell = this.pieces[k].getCell();
			if (this.cellInCellSet(cell,this.cover)){
				this.colourInCover(piece);
				//console.log("found a piece");
			}
		}
	}

	coverCount(){
		let count = 0;
		for (let k = 0; k< this.pieces.length; k++){
			let piece = this.pieces[k];
			let cell = this.pieces[k].getCell();
			if (this.cellInCellSet(cell,this.cover)){
				count ++;
			}
		}
		return count;
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
				if (!this.cellInCellSet(nbCell,this.cover)){
						this.cover.push(nbCell);
						let div = getDiv(i, j);
						//div.css("color","#99ff99");
				}
			}
		}
	}

	cellInCellSet(cell, set) {
		let i = cell.rowNum;
		let j = cell.colNum;
		for (let k=0; k < set.length; k++) {
			let current = set[k];
			if (current.rowNum == i && current.colNum == j) return true;
		}
		return false;
	}
	
	 getPiece(i, j) {
        for (let k = 0; k < this.pieces.length; k++) {
            if (this.pieces[k].isAt(i,j)) {
                return this.pieces[k];
            }
        }
        return null;
    }

	checkForSolved(){
		//1. Check that piece count == region count

		//2. Check that all pieces are not in cover
	}
}
	
	
class Region {
	constructor(board, startCell, exclusion){
		this.board = board;
		this.startCell = startCell;
		this.cells = [];
		this.cells.push(startCell);
		this.exclusion = [...exclusion];
	}

	toString(){
		return "Region length " + this.cells.length;
	}
	candidate(){
		let allCandidates = [];
		for (let i = 0; i< this.cells.length; i++){
			let nbs = this.cells[i].neumannNeighbors();
			allCandidates.push(...nbs);			
		}

		let viableCandidates = []
		for (let j = 0; j< allCandidates.length; j++){
				let selected = allCandidates[j];
				if (!this.cellInCellSet(selected, this.cells) &&
					!this.cellInCellSet(selected, this.exclusion)){
						viableCandidates.push(selected);
					}
			}
		if (viableCandidates.length !=0){
			const randomIndex = Math.floor(Math.random() * viableCandidates.length);
			return viableCandidates[randomIndex];	
		} else {
			return null;
		}
	}

	addToRegion(cell){
		this.cells.push(cell);
	}

	addToExclusion(cell){ 
		this.exclusion.push(cell);
	}

	cellInCellSet(cell, set) {
		let i = cell.rowNum;
		let j = cell.colNum;
		for (let k=0; k < set.length; k++) {
			let current = set[k];
			if (current.rowNum == i && current.colNum == j) return true;
		}
		return false;
	}

	hasCell(i,j){
		let set = this.cells;
		for (let k=0; k < set.length; k++) {
			let current = set[k];
			if (current.rowNum == i && current.colNum == j) return true;
		}
		return false;
	}

	hasExistingPiece(){
		let set = this.cells;
		for (let k=0; k < set.length; k++) {
			let current = set[k];
			if (current.decoration != "") {
				console.log("found: " + current.decoration);
				return true;
			}
		}
		return false;
	}

	getExistingPieceCell(){
		let set = this.cells;
		for (let k=0; k < set.length; k++) {
			let current = set[k];
			if (current.decoration != "") {
				console.log("found: " + current.decoration);
				return current;
			}
		}
		return null;
	}

	
	removeExistingPieces(){
		let set = this.cells;
		for (let k=0; k < set.length; k++) {
			let current = set[k];
			if (current.decoration != "") {
				console.log("found: " + current.decoration +" -- clearing");
				current.decoration = ""; 
			}
		}
	}

	
}


class RegionCalculator{
    constructor(board, initialSet) { // initial testing is with queen
        this.board = board;
		this.initialSet = initialSet;
		this.regions = [];
    }

	init(){
		this.regions = [];
		for(let i = 0; i < this.initialSet.length; i ++){
			this.regions.push(new Region(this.board, this.initialSet[i],this.initialSet));
		}
	}

	validate(){
		let total = this.totlalRegionSize();
		console.log("total regions size: " + total);
	}

	totlalRegionSize(){
		let total = 0;
		for (let i=0; i< this.regions.length; i++){
			total += this.regions[i].cells.length;
		}
		return total;
	}
	
	calculateOne(){
		for (let i = 0; i < this.regions.length; i++){
			let region = this.regions[i];
			let candidate = region.candidate();
			if (candidate != null){
				region.cells.push(candidate);
				for (let j = 0; j< this.regions.length; j++){
					if (i!=j){
						this.regions[j].exclusion.push(candidate);
					}
				}
			}
		}
	}
	calculate(){
		let limit = 64; //hardcoded
		while (this.totlalRegionSize() < limit){
			this.calculateOne();	
		}
		console.log("finished");
	}

	colourCells() {
		let colourList = ["#99FF99", "#D98899", "#7A9EC2", "#E6C88A", "#B39BC8", 
						 "#C98A70", "#76B5AE", "#A8A29E"];
	
        for (let i = 0; i < this.regions.length; i++) {
			let cregion = this.regions[i];
			//console.log("colouring region: " + cregion);
			for (let j=0; j< cregion.cells.length; j++){
				let ccell = cregion.cells[j];
				let row = ccell.rowNum;
				let col = ccell.colNum;
				let div = getDiv(row, col);
				let pdiv = div.parent();
				pdiv.css("background",colourList[i]);		
			}
		}
		for (let i = 0; i < this.board.rowNum; i++) {
            for (let j = 0; j < this.board.colNum; j++) {
                let div = getDiv(i, j);
                div.attr("style", "color:black");
                var cell = this.board.cells[i][j];
                if (cell.decoration !=""){
                    div.html(gameGlyph(i,j, cell.decoration));
                    //div.css("background","#99ff99");
                } else{
					div.html(emptyCell(i,j));
				}
            }
		}
	}

	cellInCellSet(cell, set) {
		let i = cell.rowNum;
		let j = cell.colNum;
		for (let k=0; k < set.length; k++) {
			let current = set[k];
			if (current.rowNum == i && current.colNum == j) return true;
		}
		return false;
	}

	example1(){
		this.initialSet.push(this.board.cells[0][0]);
		this.initialSet.push(this.board.cells[1][1]);
		this.initialSet.push(this.board.cells[2][2]);
		this.initialSet.push(this.board.cells[3][3]);
		this.initialSet.push(this.board.cells[4][4]);
		this.initialSet.push(this.board.cells[5][5]);
		this.initialSet.push(this.board.cells[6][6]);
		this.initialSet.push(this.board.cells[7][7]);	
	}


	example2(){
		this.initialSet.push(this.board.cells[0][0]);
		this.initialSet.push(this.board.cells[1][1]);
		this.initialSet.push(this.board.cells[2][2]);
		this.initialSet.push(this.board.cells[6][6]);
		this.initialSet.push(this.board.cells[7][7]);	
	}
	
}