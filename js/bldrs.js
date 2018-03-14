/**
* Builders to be used for HTML construction.
* ------------------------------------------
* This version of bldrs.js takes things in a little different direction.
* The builder is intended to be kept alive and updated dynamically. 
* Every time you need to represent the builder, you call the .build() method.
*/

class Bldr {

	constructor(name, id) {
		this.id = id;
		this.name = name;
		this.attributes = [];
		this.elements = [];
	}

	//for now, we do not make this recursive - just the top level builder is searched
	find(id) {
		for (var i = 0; this.elements.length; i ++) {
			var elem = this.elements[i];
			if (elem.id == id) return elem;
		}
		return null;
	}

	remove(id) {
		var pop = null;
		var reduced = [];
		for (var i = 0; this.elements.length; i ++) {
			var elem = this.elements[i];
			if (elem.id != id) {
				reduced.push(elem);
			} else {
				pop = elem;
			}
		}
		this.elements = reduced;
		return pop;
	}

	findAll(name){
		var named = [];
		for (var i = 0; this.elements.length; i ++) {
			var elem = this.elements[i];
			if (elem.name == name) named.push(elem);
		}
		return named;
	}

	att(name, value) {
		var att = new Attribute(name, value);
		this.attributes.push(att);
		return this;
	}
	// add element allows you to add a builder to a builder
	elem(bldr) {
		this.elements.push(bldr);
		return this;
	}

	text(text) {
		this.elements.push (new RawHtml(text));
		return this;
	}

	build() {
		var s = "<" + this.name;
		for(var i = 0; i< this.attributes.length; i++) {
			s += " " + this.attributes[i].toString();
		}
		s += ">";
		for(var i = 0; i< this.elements.length; i++) {
			s += " " + this.elements[i].build();
		}
		s += "</" + this.name + ">";
		return s;
	}
};

class Attribute {
	constructor(name, value) {
		this.name = name;
		this.value = value;
	}

	toString() {
		var s = "" + this.name + "='" + this.value + "'";
		return s;
	}
};

class RawHtml {
	constructor(raw) {
		this.raw = raw;
	}
	build() {
		return this.raw;
	}
};

