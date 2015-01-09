
var SSI = require("./lib/SSI");
var DirectiveHandler = require('./lib/DirectiveHandler');

(function() {
	"use strict";

	var ssi = function(inputDirectory, outputDirectory, matcher) {
		this.parser = new SSI(inputDirectory, outputDirectory, matcher);
	};

	ssi.prototype = {
		compile: function() {
			return this.parser.compile();
		},
		parse: function(filename, contents) {
			return this.parser.parse(filename, contents);
		}
	};

	ssi.handlers = DirectiveHandler.handlers = {}

	module.exports = ssi;
})();
