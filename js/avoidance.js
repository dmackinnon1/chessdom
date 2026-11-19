'use strict';

// Safe Harbour pieces need nothing beyond what Piece (chess_base.js) already does.

class PuzzleDescriptorPosition {
	constructor(i,j){
		this.row = i;
		this.col = j;
	}
	toString(){
		return "("+this.row + ", " + this.col + ")";
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

	toHTML(){
		let items = this.cells.map(position => "<li>" + position.toString() + "</li>");
		return "<h5>Place "+ this.type + "s at these positions: </br>" + "<ul>" + items.join("") + "</ul></h5>";
	}
}

class IndependentSet {
	constructor(type, size){
		this.type = type;
		this.board = new Board(size);
		this.available = this.board.cells.flat();
		this.pieces = [];
	}

	addToSet(){

		//place a random piece;
		let index = Math.floor(Math.random() * this.available.length);
		let cell = this.available[index];

		let piece = new Piece(this.type);
		piece.setCell(cell);
		this.pieces.push(piece);

		//remove the cell, and every cell the new piece attacks, from available
		let nbs = piece.neighbors();
		this.available = this.available.filter(c => c != cell && !nbs.includes(c));
	}

	buildSet(){
		// we only allow up to 12 regions in the final puzzle
		while(this.available.length !=0 && this.pieces.length < 12){
			this.addToSet();
		}
	}

	getDescriptor(){
		let descriptor = new PuzzleDescriptor(this.type, "" + this.pieces.length);
		this.pieces.forEach(p => descriptor.addCell(p.getCell().rowNum, p.getCell().colNum));
		return descriptor;
	}
	
}

// IndependentSet -> Descriptor -> RegionCalculator -> Puzzle

class AvoidancePuzzle {
	constructor(board, descriptor){
		this.board = board;
		this.descriptor = descriptor;
		this.regionCalculator = null;
		this.cover = [];
		this.pieces = [];
		this.message = "Not solved yet.";
		this.type = descriptor.type;
	}

	init(){
		this.message = "Not solved yet.";
		this.type = this.descriptor.type;
		this.removePieces();
		// the descriptor holds positions; look up the matching cells on this puzzle's board
		let initialSet = this.descriptor.cells.map(position => this.board.cells[position.row][position.col]);

		this.regionCalculator = new RegionCalculator(this.board, initialSet);
		this.regionCalculator.init();
		this.regionCalculator.calculate();
		evnts.fireEvent("refreshMessage");
	}

	solutionHTML(){
		return this.descriptor.toHTML();
	}
	removePieces(){
		this.pieces.forEach(p => p.getCell().decoration = "");
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
        let cell = this.getCell(i,j);
		this.selectCell(cell, target);
    }

	getRegionID(i,j){
		// findIndex returns -1 when no region matches, just as before
		let cell = this.getCell(i,j);
		return this.regionCalculator.regions.findIndex(region => region.hasCell(cell));
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

		let region = this.getRegionByID(regionId);
		
		//2. If the region has an piece remove it
		let removeOnly = false;
		if (region.hasExistingPiece()) {
			let oldCell = region.getExistingPieceCell();
			let oldPiece = this.getPiece(oldCell.rowNum, oldCell.colNum);
			this.pieces = this.pieces.filter(p => p !== oldPiece); 
			region.removeExistingPieces();
			if (oldCell === targetCell){
				removeOnly = true;
			}
		}

		//3. Place a piece in the cell
		if (!removeOnly){
			let piece = new Piece(this.type);
			this.pieces.push(piece);
			piece.setCell(targetCell);
		}
		this.colourCells(); 

		//highlight problems
		this.calculateCover();

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
		this.piecesInCover().forEach(piece => this.colourInCover(piece));
	}

	// pieces that another piece can capture
	piecesInCover(){
		return this.pieces.filter(p => this.cover.includes(p.getCell()));
	}

	coverCount(){
		return this.piecesInCover().length;
	}

	calculateCover(){
		this.cover = [];
		this.pieces.forEach(selected => {
			selected.neighbors().forEach(nbCell => {
				if (!this.cover.includes(nbCell)){
					this.cover.push(nbCell);
				}
			});
		});
	}

	getPiece(i, j) {
		return this.pieces.find(p => p.isAt(i,j)) ?? null;
	}
}
	
	
class Region {
	constructor(startCell, exclusion){
		this.cells = [];
		this.cells.push(startCell);
		this.exclusion = [...exclusion];
	}

	toString(){
		return "Region length " + this.cells.length;
	}
	candidate(){
		// flatMap: collect the up/down/left/right neighbours of every cell into one list
		// (a cell next to two region cells appears twice, making it a more likely pick)
		let viableCandidates = this.cells
			.flatMap(c => c.neumannNeighbors())
			.filter(c => !this.cells.includes(c) && !this.exclusion.includes(c));
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

	hasCell(cell){
		return this.cells.includes(cell);
	}

	hasExistingPiece(){
		return this.cells.some(current => current.decoration != "");
	}

	getExistingPieceCell(){
		return this.cells.find(current => current.decoration != "") ?? null;
	}

	removeExistingPieces(){
		this.cells.forEach(current => current.decoration = "");
	}
}


class RegionCalculator{
    constructor(board, initialSet) { // initial testing is with queen
        this.board = board;
		this.initialSet = initialSet;
		this.regions = [];
    }

	init(){
		this.regions = this.initialSet.map(cell => new Region(cell, this.initialSet));
	}

	totalRegionSize(){
		return this.regions.reduce((total, region) => total + region.cells.length, 0);
	}

	// grow every region by one cell (if it can), and keep the other regions out of that cell
	calculateOne(){
		this.regions.forEach(region => {
			let candidate = region.candidate();
			if (candidate != null){
				region.addToRegion(candidate);
				this.regions
					.filter(other => other !== region)
					.forEach(other => other.addToExclusion(candidate));
			}
		});
	}

	// keep growing until the regions cover the whole board
	// (a while loop fits here: we don't know in advance how many rounds it takes)
	calculate(){
		let boardSize = this.board.rowNum * this.board.colNum;
		while (this.totalRegionSize() < boardSize){
			this.calculateOne();
		}
	}

	colourCells() {
		let colourList = ["#99FF99", "#D98899", "#7A9EC2", "#E6C88A", "#B39BC8", 
						 "#C98A70", "#76B5AE", "#A8A29E", "#E8DF6E", "#7CC2EB", 
						  "#E6A378", "#C5D97E"];
	
		// colour the table cell (the div's parent) behind each square by region
		this.regions.forEach((region, index) => {
			region.cells.forEach(cell =>
				getDiv(cell.rowNum, cell.colNum).parent().css("background", colourList[index]));
		});

		this.board.cells.flat().forEach(cell => {
			let i = cell.rowNum;
			let j = cell.colNum;
			let div = getDiv(i, j);
			div.attr("style", "color:black");
			if (cell.decoration !=""){
				div.html(gameGlyph(i,j, cell.decoration));
			} else{
				div.html(emptyCell(i,j));
			}
		});
	}
}