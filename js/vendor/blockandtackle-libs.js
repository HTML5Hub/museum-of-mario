/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
	var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;

	// The base Class implementation (does nothing)
	this.Class = function(){};
	this.Class.prototype = new $();//Keith: I extended the jQuery object, so we can treat ViewControllers as views directly.

	// Create a new Class that inherits from this class
	Class.extend = function(prop) {
		var _super = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var prototype = new this();
		initializing = false;

		// Copy the properties over onto the new prototype
		for (var name in prop) {
			// Check if we're overwriting an existing function
			prototype[name] = typeof prop[name] == "function" &&
			typeof _super[name] == "function" && fnTest.test(prop[name]) ?
			(function(name, fn){
				return function() {
				var tmp = this._super;

				// Add a new ._super() method that is the same method
				// but on the super-class
				this._super = _super[name];

				// The method only need to be bound temporarily, so we
				// remove it when we're done executing
				var ret = fn.apply(this, arguments);
				this._super = tmp;

				return ret;
				};
			})(name, prop[name]) :
			prop[name];
		}

		// The dummy class constructor
		function Class() {
			// All construction is actually done in the init method
			if ( !initializing && this.init )
			this.init.apply(this, arguments);
		}

		// Populate our constructed prototype object
		Class.prototype = prototype;

		// Enforce the constructor to be what we expect
		Class.prototype.constructor = Class;

		// And make this class extendable
		Class.extend = arguments.callee;

		return Class;
	};
})();



/*****
Class: Controller
Extends: Class
Notes: All classes should extend this class. It adds additional methods that are needed throughout the app.
*****/


//STATIC VARS
//


//CONSTRUCTOR
function Controller(){} //Extends Class (at bottom of page).
Controller.prototype.type = 'Controller';
Controller.prototype.init = function(onComplete){
	if(__config.logging){
		log('');
		log('new '+this.toString()+'()');
		logMethod(this, 'init', arguments);
		//logMethod(this, this.init, arguments);//Todo: This is supposed to include the parameters, but it doens't work yet.
	}

	this.inited = true;
};


//PUBLIC INSTANCE METHODS
Controller.prototype.addEventListener = function(eventName, originalScope, listenerFunction){//(String, obj, function):void
	if(!eventName || !originalScope || !listenerFunction) e.e;//Throw a runtime error. You must provide an original scope.
	if(!this.listeners) this.listeners = [];
	if(this.hasEventListener(eventName, listenerFunction, originalScope)) return;//don't add a duplicate listener
	this.listeners.push({eventName:eventName, listenerFunction:listenerFunction, originalScope:originalScope});
};
Controller.prototype.hasEventListener = function(eventName, originalScope, listenerFunction){//(String, obj, function):Boolean
	if(!this.listeners) return false;
	for(var i=0; i<this.listeners.length; i++){
		var listener = this.listeners[i];
		if((eventName == listener.eventName) && (listenerFunction == listener.listenerFunction)){
			return true;
		}
	}
	return false;
};
Controller.prototype.removeEventListener = function(eventName, listenerFunction){//(String, function):void
	if(!this.listeners) return;
	for(var i=0; i<this.listeners.length; i++){
		var listener = this.listeners[i];
		if((eventName == listener.eventName) && (listenerFunction == listener.listenerFunction)){
			this.listeners.splice(i, 1);
			return;
		}
	}
};
Controller.prototype.toString = function(){
	//return typeOfObject(this);
	var funcNameRegex = /function (.{1,})\(/;
	var results = (funcNameRegex).exec((this).constructor.toString());
	if(this.type) return this.type;
	return (results && results.length > 1) ? results[1] : "";
};


//PRIVATE INSTANCE METHODS
Controller.prototype._dispatchEvent = function(eventName, data){//(String, obj):void
	if(!this.listeners) return;
	var i=0;
	for(var i=0; i<this.listeners.length; i++){
		var listener = this.listeners[i];
		if(eventName == listener.eventName){
			listener.listenerFunction(eventName, listener.originalScope, data);
		}
	}
};


//EXTEND Class
Controller = Class.extend(new Controller());


/*****
End class: Controller
*****/



/*****
Class: ViewController
Extends: Controller
Notes: All view classes should extend this class. It adds additional methods that are needed throughout the app.
*****/


//CONSTRUCTOR
function ViewController(){}//Extends Controller (at bottom of page).
ViewController.prototype.type = 'ViewController';
ViewController.prototype.init = function(view, model, onComplete){//(Boolean):void
	this._super(onComplete);

	//SETTINGS
	this.settings = {};//Object

	//VIEW
	this.view = view;//DOMElement
	this.$view = $(view);//jQuery obj
	this.children = {};//Object

	//MODEL
	this.model = model;//Object

	//CONTROLLER
	this.id = view.id;
	this.setWidth = null;//Number
	this.setHeight = null;//Number
	this.inited = false;
	this.readied = false;//Boolean
	this.transitionState = null;//Enumeration of ViewController.TRANSITION_STATE__...

	//INIT CONTROLS
	//

	//INIT INTERACTION
	//

	this.inited = true;
	if(onComplete) onComplete();
};


//PUBLIC INSTANCE METHODS
ViewController.prototype.deinit = function(){//(Boolean):void
	this._super(onComplete);

	//DEINIT MODEL
	this.model = null;
	this.setModel(null);//I'm not sure if we should run this or not.

	//DEINIT CONTROLLER
	this.inited = false;
	this.readied = false;
	this.animatingIn = false;
	this.animatedIn = false;
	this.setWidth = null;
	this.setHeight = null;

	//REMOVE INTERACTION
	//

	//DEINIT VIEW AND CHILDREN
	this.view = null;
	this.$view = null;
	this.children = null;
	for(var i in children){
		var child = children[i];
		if(child.parent) child.parent.removeChild(child);
		children[i] = null;
	}
};
ViewController.prototype.ready = function(onComplete){//(Function):void
	logMethod(this, 'ready', arguments);

	//DEFINE AND INIT CHILDREN (before calling super)
	//

	//READY CHILDREN
	for(var i in this.children){
		var child = this.children[i];
		if(child){
			if(child.ready){
				if(child.readied) e.e;//This should not occur.
				child.ready();
			}
		}
	}

	//INIT INTERACTION
	//

	//SET INITIAL STATE
	//this.transition('out', true);//Prepare for animation in, OR
	//this.transition('in', true);//Set to default state.

	//PLAY ANIMATION
	//

	this.readied = true;
	if(onComplete) onComplete();
};
ViewController.prototype.reset = function(resetModel){//(Boolean):void
	logMethod(this, 'reset', arguments);
	if(resetModel){
		this.deinit();
		this.init();
	}else{
		//Todo: Reset the initial state without changing the model.
	}
};
ViewController.prototype.setModel = function(model){//(_.Model):void
	logMethod(this, 'setModel', arguments);

	this.model = model;
	var hasModelChanged = (model != this.model);
	if(hasModelChanged){
		//APPLY MODEL TO SELF
		this.reset(false);//Reset the view
		this.model = model;

		//APPLY MODEL TO CHILDREN
		//
	}

	//UPDATE THE VIEW
	this.apply();

	if(hasModelChanged){
		//goto();
	}
};
ViewController.prototype.apply = function(){//(void):void //Applies the model to view.
	logMethod(this, 'apply', arguments);

	//RESET UI
	//

	//APPLY MODEL
	if(this.model){

		//CREATE CONTROLS
		//

		//INIT INTERACTIVITY
		//

	}
};
ViewController.prototype.setSize = function(w, h){//(int, int):void{
	logMethod(this, 'setSize', arguments);
	if(w >= 0){
		this._setWidth = w;
	}
	if(h >= 0){
		this._setHeight = h;
	}
};

//TRANSITIONS (See transitions.png for a diagram of how this works.)
ViewController.prototype.transition = function(direction, instant, prepareForTransition, onComplete){//(String 'in' or 'out', Boolean, Boolean):void{
	//Do not override this method. Instead, override _transitionIn and _transitionOut.
	logMethod(this, 'transition', arguments);
	if(instant === null) instant = false;
	if(prepareForTransition === null) prepareForTransition = false;
	if(instant && prepareForTransition) e.e;//Both values should not be true. If it is instant, there it no need to prepare for the transition.
	if(direction == 'in'){
		if(prepareForTransition){
			this.transition('out', true);//Prepare for the transition by setting all properties instantly.
		}
		this.transitionState = ViewController.TRANSITION_STATE__IN;
		this._transitionIn(instant, function(){
			this.transitionState = ViewController.TRANSITION_STATE__GOING_IN;
			if(onComplete) onComplete();
		});

	}else if(direction == 'out'){
		if(prepareForTransition){
			this.transition('in', true);
		}
		this.transitionState = ViewController.TRANSITION_STATE__OUT;
		this._transitionOut(instant, function(){
			this.transitionState = ViewController.TRANSITION_STATE__GOING_OUT;
			if(onComplete) onComplete();
		});
	}
};
ViewController.prototype._transitionIn = function(instant, onComplete){//(Boolean)
	//It is usually best to override this method.
	//Do not call this method directly. It is called via transition.
	logMethod(this, '_transitionIn', arguments);
	if(instant){
		this.$view.transition({opacity:1});
		onComplete();
		return;
	}
	var duration = 1000;
	this.$view.transition({
		opacity:1,
		duration:duration,
		complete: function(){
			if(onComplete) onComplete();
		}
	});
};
ViewController.prototype._transitionOut = function(instant, onComplete){//(Boolean)
	//It is usually best to override this method.
	//Do not call this method directly. It is called via transition.
	logMethod(this, '_transitionOut', arguments);
	if(instant){
		this.$view.transition({opacity:0});
		onComplete();
		return;
	}
	var duration = 1000;
	if(instant) duration = 0;
	this.$view.transition({
		opacity:1,
		duration:duration,
		complete: function(){
			if(onComplete) onComplete();
		}
	});
};


//EXTEND Controller
ViewController = Controller.extend(new ViewController());


//STATIC VARS (need to be below the extension)
//ViewController.CONSTANT = 1;
ViewController.TRANSITION_STATE__IN = 'in';//Phase 1
ViewController.TRANSITION_STATE__OUT = 'out';//Phase 2
ViewController.TRANSITION_STATE__GOING_IN = 'goingIn';//Phase 3 (Normal state)
ViewController.TRANSITION_STATE__GOING_OUT = 'goingOut';//Phase 4


/*****
End Class: ViewController
*****/








//UTILITY METHODS (read-only)
function log(msg, useInBrowserLog){
    if(console) console.log(msg);
}
function clone(obj){
	var theClone = jQuery.extend(true, {}, obj);//duplicates the object, via http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-a-javascript-object
	return theClone;
}
function disableSelectionOnMobileBrowsers(){
	$.fn.extend({//via http://stackoverflow.com/questions/1794220/how-to-disable-mobilesafari-auto-selection
	        disableSelection : function() {
	                this.each(function() {
	                        this.onselectstart = function() { return false; };
	                        this.unselectable = "on";
	                        $(this).css('-moz-user-select', 'none');
	                        $(this).css('-webkit-user-select', 'none');
	                });
	        }
	});
	$('body').css('-webkit-user-select', 'none');
}
function radiansToDegrees(angleInRadians) {
	return angleInRadians * (180 / Math.PI);
}
function degreesToRadians(angleInDegrees) {
    //2*Math.PI = 360deg
    //x radians * 2*Math.PI = y deg
    //Solve for x, if y is known.
    //Example: x * 2*Math.PI = 45deg
    //45deg / (2*Math.PI) = x radians
    //45deg / (2*Math.PI) = 7.16 radians

    var radiansPerDegree = (2*Math.PI)/360;//.0174 radians per degree
    var radians = angleInDegrees * radiansPerDegree;

    //var value = angleInDegrees * (Math.PI / 180);
    //var angle = i*(360/_.channelBubbles.length);
	//var angle = i*(2*Math.PI/_.channelBubbles.length);
    return radians;
}
function supportsWebGL(){
	//via https://github.com/mrdoob/three.js/wiki/Detecting-WebGL-and-browser-compatibility-with-three.js
	//Modernizer does NOT work, since it says Safari has WebGL. Safari has WebGL, but it is disabled by default.
    try {
        return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
    } catch(e) {
        return false;
    }
}
function browserSupportsVideoAutoplay(){//(void):Boolean
	var value = !isTheUserOnAPhone();
	return value;
}

function isTheUserOnAPhone(){
	var isPhoneUserAgent = (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent));
	return isPhoneUserAgent;
}

/* Cookies, via http://techpatterns.com/downloads/javascript_cookies.php */
function setCookie( name, value, expires, path, domain, secure )
{
	// set time, it's in milliseconds
	var today = new Date();
	today.setTime( today.getTime() );

	/*
	if the expires variable is set, make the correct
	expires time, the current script below will set
	it for x number of days, to make it for hours,
	delete * 24, for minutes, delete * 60 * 24
	*/
	if ( expires )
	{
	expires = expires * 1000 * 60 * 60 * 24;
	}
	var expires_date = new Date( today.getTime() + (expires) );

	document.cookie = name + "=" +escape( value ) +
	( ( expires ) ? ";expires=" + expires_date.toGMTString() : "" ) +
	( ( path ) ? ";path=" + path : "" ) +
	( ( domain ) ? ";domain=" + domain : "" ) +
	( ( secure ) ? ";secure" : "" );
}

// This fixes an issue with the old method, ambiguous values
// with this test document.cookie.indexOf( name + "=" );
function getCookie( check_name ) {
	// first we'll split this cookie up into name/value pairs
	// note: document.cookie only returns name=value, not the other components
	var a_all_cookies = document.cookie.split( ';' );
	var a_temp_cookie = '';
	var cookie_name = '';
	var cookie_value = '';
	var b_cookie_found = false; // set boolean t/f default f

	for ( i = 0; i < a_all_cookies.length; i++ )
	{
		// now we'll split apart each name=value pair
		a_temp_cookie = a_all_cookies[i].split( '=' );


		// and trim left/right whitespace while we're at it
		cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');

		// if the extracted name matches passed check_name
		if ( cookie_name == check_name )
		{
			b_cookie_found = true;
			// we need to handle case where cookie has no value but exists (no = sign, that is):
			if ( a_temp_cookie.length > 1 )
			{
				cookie_value = unescape( a_temp_cookie[1].replace(/^\s+|\s+$/g, '') );
			}
			// note that in cases where cookie is initialized but no value, null is returned
			return cookie_value;
			//break;
		}
		a_temp_cookie = null;
		cookie_name = '';
	}
	if ( !b_cookie_found )
	{
		return null;
	}
}

// This deletes the cookie when called.
function Delete_Cookie( name, path, domain ) {
	if ( getCookie( name ) ) document.cookie = name + "=" +
	( ( path ) ? ";path=" + path : "") +
	( ( domain ) ? ";domain=" + domain : "" ) +
	";expires=Thu, 01-Jan-1970 00:00:01 GMT";
}

/* /Cookies */
