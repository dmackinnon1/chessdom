'use strict';
let gameType ={};

class Cell {
		
	constructor(rowNum, colNum, board) {
		this.rowNum = rowNum;
		this.colNum = colNum;
		this.board = board;
		this.decoration = "";
	}
	
	
	neighbor(i,j) {
		if ((this.rowNum + i < this.board.getRowSize())
			&&(this.rowNum + i >= 0)
			&&(this.colNum + j < this.board.getColumnSize())
			&&(this.colNum + j >= 0)){
			return this.board.cells[this.rowNum + i][this.colNum + j];
		}
		return null;
	}
	
	nne(){
		return this.neighbor(2,1);
	}
	
	nnw(){
		return this.neighbor(2,-1);
	}
	
	ene(){
		return this.neighbor(1,2);		
	}
	
	wnw(){
		return this.neighbor(1,-2);
	}
	
	sse(){
		return this.neighbor(-2,1);
	}
	
	ese(){
		return this.neighbor(-1,2);
	}
	
	ssw(){
		return this.neighbor(-2,-1)
	}
	
	wsw(){
		return this.neighbor(-1,-2);
	}
	
	north(){
		return this.neighbor(1,0);
	}
	
	south(){
		return this.neighbor(-1,0);
	}
	
	east(){
		return this.neighbor(0,1);		
	}
	
	west(){
		return this.neighbor(0,-1);
	}
	
	northEast(){
		return this.neighbor(1,1);
	}
	
	northWest(){
		return this.neighbor(1,-1);
	}
	
	southEast(){
		return this.neighbor(-1,1)
	}
	
	southWest(){
		return this.neighbor(-1,-1);
	}
	
	// every other cell in this cell's row
	row(){
		return this.board.cells[this.rowNum].filter(c => c.colNum !== this.colNum);
	}

	// every other cell in this cell's column
	column(){
		return this.board.cells.map(r => r[this.colNum]).filter(c => c.rowNum !== this.rowNum);
	}

	// cells from here to the edge of the board, stepping (di, dj) each time
	// (a while loop is still the clearest way to walk until we fall off the board)
	ray(di, dj){
		let cells = [];
		let next = this.neighbor(di, dj);
		while (next != null) {
			cells.push(next);
			next = next.neighbor(di, dj);
		}
		return cells;
	}

	downDiagonal(){
		return [...this.ray(1, 1), ...this.ray(-1, -1)];
	}

	upDiagonal(){
		return [...this.ray(-1, 1), ...this.ray(1, -1)];
	}

	//refactor this and glyph to be functional
	neighbors(){
		if (this.decoration == "knight") { 
			return this.knightNeighbors();
		} 

		if (this.decoration == "king") {
			return this.kingNeighbors();
		} 

		if (this.decoration == "rook") {
			return this.rookNeighbors();
		}

		if (this.decoration == "bishop") {
			return this.bishopNeighbors();
		}
		if (this.decoration == "queen") {
			return this.queenNeighbors();
		}

	}

	queenNeighbors() {
		let queen = this.rookNeighbors();
		Array.prototype.push.apply(queen, this.bishopNeighbors());
		return queen;
	}

	rookNeighbors(){
		let rook = this.column();
		Array.prototype.push.apply(rook, this.row());
		return rook;
	}

	bishopNeighbors(){
		let bish = this.upDiagonal();
		Array.prototype.push.apply(bish, this.downDiagonal());
		return bish;
	}

	kingNeighbors() {
		let list = [];
		if(this.north() != null) list.push(this.north());
		if(this.south() != null) list.push(this.south());
		if(this.east() != null) list.push(this.east());
		if(this.west() != null) list.push(this.west());
		
		if(this.northEast() != null) list.push(this.northEast());
		if(this.northWest() != null) list.push(this.northWest());
		if(this.southEast() != null) list.push(this.southEast());
		if(this.southWest() != null) list.push(this.southWest());				
		return list;
	}

	knightNeighbors() {
		let list = [];
		if(this.ese() != null) list.push(this.ese());
		if(this.sse() != null) list.push(this.sse());
		if(this.wsw() != null) list.push(this.wsw());
		if(this.ssw() != null) list.push(this.ssw());
		
		if(this.ene() != null) list.push(this.ene());
		if(this.nne() != null) list.push(this.nne());
		if(this.wnw() != null) list.push(this.wnw());
		if(this.nnw() != null) list.push(this.nnw());
		return list;
	}

	neumannNeighbors(){
		var list = [];
		if(this.north() != null) list.push(this.north());
		if(this.south() != null) list.push(this.south());
		if(this.east() != null) list.push(this.east());
		if(this.west() != null) list.push(this.west());
		return list;
	}

	toString() {
		return "Cell [" + this.rowNum + "][" + this.colNum +"]: " + this.decoration;
	}

	position(){
		return "(" +this.rowNum + "," + this.colNum + ")";
	}

	isEqual(other) {
		let result =(this.rowNum === other.rowNum) && (this.colNum === other.colNum);
		return result;
	}
};

class Board {

	constructor(size) {
		this.size = size;
		this.rowNum = size;
		this.colNum = size;
		this.cells = [];
	}
	
	init() {
		this.cells = Array.from({length: this.rowNum}, (_, i) =>
			Array.from({length: this.colNum}, (_, j) => new Cell(i, j, this)));
	}
	randomStart() {
		let i = randomInt(this.rowNum);
		let j = randomInt(this.colNum);
		return this.cells[i][j];
	}
	
	getRowSize() {
		return this.rowNum;
	}
	getColumnSize(){
		return this.colNum;
	}
};


/**
* display 
*/

function htmlForBoard(board) {
	let rows = board.cells.map((row, i) => {
		let tds = row.map((c, j) =>
			"<td><div id='cell" + i +""+ j +"' class='gameCell' onclick='cellClick(event)'"
			+ " data-row='"+ i + "' data-col='" + j + "'>"
			+ emptyCell(i,j) + "</div></td>");
		return "<tr>" + tds.join("") + "</tr>";
	});
	return "<table border = 1 cellspacing = 1 cellpadding = 1 align='center'>" + rows.join("") + "</table>";
};

function emptyCell(i,j){
	let empty = new Bldr("svg").att("width","28").att("height","28");
	empty.att("data-row",i).att("data-col",j);
	empty.att("stroke-width",0);
	return empty.build();
};

function cellClick(event) {
	let i = parseInt(event.target.getAttribute("data-row"));
	let j = parseInt(event.target.getAttribute("data-col"));
	game.clicked(i,j, event.target); //event.target
};

function getDiv(i,j) {
	return $("#cell" + i +""+j);
};
	

//object containing displayable elements
let gameDisplay = {};
gameDisplay.map = "";
gameDisplay.score = "";
gameDisplay.status = "";

/**
 * utilities
 */
function randomInt(lessThan){
	var selection = Math.floor(Math.random()*(lessThan));
	return selection;
};

// [0, 1, ..., n-1] -- handy for looping a fixed number of times with forEach
function range(n){
	return [...Array(n).keys()];
};

function svgMap(pieces, cover, size) {
	let svg = new Bldr("svg");
	let boardSize = 30*size;
	svg.att("align", "center").att("width",boardSize).att("height",boardSize);
	let cellSize = boardSize/size;
	//first the board: shade the squares where i and j are both even or both odd
	range(size).forEach(i => range(size).forEach(j => {
		if ((i + j) % 2 == 0){
			let rect = new Bldr("rect").att("x", i*cellSize).att("y", j*cellSize);
			rect.att("width", cellSize).att("height",cellSize).att("fill", "#ccccb3");
			svg.elem(rect);
		}
	}));

	//finally, the dots
	let dot = (cell, radius, fill) => {
		let circle = new Bldr("circle").att("cx", 15 + cell.colNum*cellSize).att("cy", 15 + cell.rowNum*cellSize);
		circle.att("r", radius).att("stroke", "black").att("stroke-width",1).att("fill", fill);
		svg.elem(circle);
	};
	pieces.forEach(cell => {
		dot(cell, 3, "grey");
		dot(cell, 6, "black");
	});
	cover.forEach(cell => dot(cell, 3, "grey"));

	return svg.build();
};

function knightGlyph(i,j){
	let glyph = "<span class='glyphicon glyphicon-knight' ";
	glyph += " data-row='"+ i + "' data-col='" + j + "'>";
	return glyph;	
};

function kingGlyph(i,j){
	let glyph = "<span class='glyphicon glyphicon-king' ";
	glyph += " data-row='"+ i + "' data-col='" + j + "'>";
	return glyph;	
};

function rookGlyph(i,j){
	let glyph = "<span class='glyphicon glyphicon-tower' ";
	glyph += " data-row='"+ i + "' data-col='" + j + "'>";
	return glyph;	
};

function bishopGlyph(i,j){
	let glyph = "<span class='glyphicon glyphicon-bishop' ";
	glyph += " data-row='"+ i + "' data-col='" + j + "'>";
	return glyph;	
};

function queenGlyph(i,j){
	let glyph = "<span class='glyphicon glyphicon-queen' ";
	glyph += " data-row='"+ i + "' data-col='" + j + "'>";
	return glyph;	
};

function blankGlyph(i,j){
	let glyph = "<span class='glyphicon glyphicon-square-empty' ";
	glyph += " data-row='"+ i + "' data-col='" + j + "'>";
	return glyph;	
};

function gameGlyph(i,j, type) {
	if (type == "knight"){
		return knightGlyph(i,j);
	}
	if (type == "king"){
		return kingGlyph(i,j);
	}
	if (type == "rook") {
		return rookGlyph(i,j);
	}
	if (type == "bishop") {
		return bishopGlyph(i,j);
	}
	if (type == "queen") {
		return queenGlyph(i,j);
	}
	return blankGlyph(i,j);
}