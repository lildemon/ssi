
var fs = require("fs");
var glob = require("glob");
var escape = require("html-escape");
var IOUtils = require("./IOUtils");
var DirectiveHandler = require("./DirectiveHandler");

var DIRECTIVE_MATCHER = /<!--#([a-z]+)([ ]+([a-z]+)="(.+?)")* -->/g;

(function() {
	"use strict";

	var ssi = function(inputDirectory, outputDirectory, matcher) {
		this.inputDirectory = inputDirectory;
		this.documentRoot = inputDirectory;
		this.outputDirectory = outputDirectory;
		this.matcher = matcher;

		this.ioUtils = new IOUtils(this.documentRoot);
		this.directiveHandler = new DirectiveHandler(this.ioUtils);
		this.directiveHandler.parser = this;
		this.customHandlers = {}
	};

	ssi.prototype = {
		compile: function() {
			//noinspection JSUnresolvedFunction
			var files = glob.sync(this.inputDirectory + this.matcher);

			for (var i = 0; i < files.length; i++) {
				var input = files[i];
				var contents = fs.readFileSync(input, {encoding: "utf8"});
				var data = this.parse(input, contents);

				var output = input.replace(this.inputDirectory, this.outputDirectory);
				this.ioUtils.writeFileSync(output, data.contents);
			}
		},

		parse: function(filename, contents, variables, includeStack) {
			if(!includeStack) {
				includeStack = [];
			}
			if(!!~includeStack.indexOf(filename)) {
				return {contents: '<strong style="color:#F00">错误！ 文件' + filename + '产生了循环引用</strong>', variables: variables};
			}
			includeStack = includeStack.concat([filename]);
			var instance = this;
			variables = variables || {};

			contents = contents.replace(new RegExp(DIRECTIVE_MATCHER), function(directive, directiveName) {

				var data = {};
				try {
					data = instance.directiveHandler.handleDirective(directive, directiveName, filename, variables, includeStack);
				} catch (e) {
					data.error = e
				}
				

				if (data.error) {
					return "无法解析ssi标签： " + escape(directive) + '<br />' + data.error + '<br />' + '文件： '+ filename
					//throw data.error;
				}

				for (var key in data.variables) {
					if (data.variables.hasOwnProperty(key)) {
						variables[data.variables[key].name] = data.variables[key].value;
					}
				}

				return (data && data.output) || "";
			});

			return {contents: contents, variables: variables};
		}
	};

	module.exports = ssi;
})();

