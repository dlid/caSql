
var ExamplesTabComponent = { 
	template: '#ExamplesTab-template',
	mounted : function() {
	 	setTimeout(PR.prettyPrint, 10);


	},
	methods : {
		cutDownSql : function(s) {
			if (s.length > 70) {
				return s.substring(0, 67) + "...";
			}
			return s;
		},
		urifyString : function(str) {
			str = str.toLowerCase();
			var newString = "";
			for (var i=0; i <  str.length; i++) {
				if (str[i].match(/[a-z0-9-_]/)) {
					newString += str[i];
				} else if (str[i] == " ") {
					newString += "-";
				}
			}
			newString = newString.replace(/-{2,}/, '-');
			return newString;
		}
	},
	computed : {
		examples : function() {
		return this.globals.examples
	}
	},
	data : function() {
		return {
			globals : appGlobals
		} 
	},
	watch: {
	    '$route' : function(to, from) {
	      // react to route changes...
	    } 
	  }
}