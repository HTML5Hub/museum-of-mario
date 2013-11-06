(function UMD(name,context,definition) {
	if (typeof module != "undefined" && module.exports) module.exports = definition();
	else if (typeof define == "function" && define.amd) define(definition);
	else context[name] = definition(name,context);
})("Pages",this,function definition(name,context) {
	"use strict";



	// parseUri 1.2.2
	// (c) Steven Levithan <stevenlevithan.com>
	// MIT License
	function parseUri(e){var a=parseUri.options,f=a.parser[a.strictMode?"strict":"loose"].exec(e),b={},c=14;while(c--)b[a.key[c]]=f[c]||"";b[a.q.name]={};b[a.key[12]].replace(a.q.parser,function(h,d,g){if(d)b[a.q.name][d]=g});return b}parseUri.options={strictMode:false,key:["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],q:{name:"queryKey",parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:{strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}};

	function getPageURL(url) {
		var uriparts = parseUri(url);
		if (!uriparts.path) {
			return "/";
		}
		else {
			return uriparts.path;
		}
	}

	function siteInit() {
		page_title = $("title").html();

		History.Adapter.bind(window,"statechange",function(){
			var state = History.getState();

			if (getPageURL(state.url) !== current_page_url) {
				gotoPage(state.url,/*suppressHistory=*/true);
			}
		});

		$(context.document.body).on("click","a:not([data-ignore])",function(evt){
			var href = evt.currentTarget.href;

			// disable JS-only (or just empty) links
			if (evt.currentTarget.getAttribute("href") === "#") {
				evt.preventDefault();
				evt.stopImmediatePropagation();
			}
			else if (recognize(href) !== false) {
				evt.preventDefault();
				evt.stopImmediatePropagation();

				gotoPage(href);
			}
		});

		// extract nav links array from the DOM
		$("#global-nav .era-link").each(function(){
			var $nav_links = $(this).children(".era-nav").find("a");

			if ($nav_links.length > 0) {
				$nav_links.each(function(){
					nav.push(this.getAttribute("href"));
				});
			}
			else {
				$(this).children("a").each(function(){
					nav.push(this.getAttribute("href"));
				});
			}
		});

		current_page_num = nav.indexOf(current_page_url);

		if (!~current_page_num) {
			current_page_num = 0;
		}

		var $refreshIcons = $('#refresh-icon, #refresh-animation')
		$refreshIcons.click(function(event) {
			refreshPage();
		});

		var audioButton1 = $('#audio-control-1')[0];//In header of mobile.
		var audioButton2 = $('#audio-control-2')[0];//In footer.
		var audioButtons = [audioButton1, audioButton2];
		var audioButton1__icon = audioButton1.children[0];
		var audioButton2__icon = audioButton1.children[0];
		var audioButton__icons = [audioButton1__icon, audioButton2__icon];
		//$(audioButtons).bind('click touchstart', function(event){
		$(audioButtons).bind('click', function(event){
			if(window._AVManager.isMuted){
				window._AVManager.unmute();
				//Unmute the current page.
				var currentPageViewController = public_api.page_scripts[
					(current_page_url === "/" ? "/index" : current_page_url)
				];
				if(currentPageViewController.unmute){
					currentPageViewController.unmute();
				}
			}else{
				window._AVManager.mute();
			}
		});

		highlightPageNav();
	}

	function gotoPage(url,suppressHistory) {
		var content_html, copy_html, page_url;

		page_url = recognize(url);

		if (page_url !== false) {
			if (page_url !== current_page_url) {
				// teardown the existing page
				public_api.page_scripts[
					(current_page_url === "/" ? "/index" : current_page_url)
				].teardown();

				current_page_url = page_url;
				current_page_num = nav.indexOf(current_page_url);
				if (!~current_page_num) {
					current_page_num = 0;
				}

				fetchPageScript(current_page_url,function(){
					content_html = getPageContentHTML(current_page_url);
					content_html = $("<div>" + content_html + "</div>").find("#content").html();
					copy_html = getPageCopyHTML(current_page_url);
					copy_html = $("<div>" + copy_html + "</div>").find(".article-wrapper .game-block-inner").html();

					ScrollPager.switchPage(current_page_num,content_html,copy_html);

					// initialize later if mobile for better performance
					if(!isMobile){
						public_api.page_scripts[
							(current_page_url === "/" ? "/index" : current_page_url)
						].init();
					}

					highlightPageNav();
				});

				if (!suppressHistory) {
					History.pushState(null,null,url);
					document.title = page_title;
				}

				trackPage(current_page_url);

				return;
			}
		}

		if (url !== context.document.location.href.toString()) {
			context.document.location.href = url;
			current_page_url = url;
		}
	}

	function refreshPage(){
		var currentPageViewController = public_api.page_scripts[
			(current_page_url === "/" ? "/index" : current_page_url)
		];
		if(currentPageViewController.refresh){
			currentPageViewController.refresh();
		}
	}

	function highlightPageNav() {
		var $navitem;

		$("#global-nav .era-link.active .era-nav li a.active, #global-nav .era-link.active").removeClass("active");

		$navitem = $("#global-nav .era-link .era-nav li a[href='" + nav[current_page_num] + "']");
		if ($navitem.length > 0) {
			$navitem.closest(".era-link").addClass("active");
			$navitem.addClass("active");
		}
		else {
			$("#global-nav .era-link a[href='" + nav[current_page_num] + "']")
			.closest(".era-link").addClass("active");
		}
	}



	function setMobileCardToggle(){
		$('#mobile-fullscreen-toggle').click(function() {
			$('.article-wrapper').toggleClass('open');
		});
	}

	function fetchPageScript(url,cb) {
		// Examples:
		// /js/index.js
		// /js/arcade-era/donkey-kong.js
		// /js/arcade-era/mario-bros.js
		// /js/8bit-era/super-mario-bros-2.js
		// /js/8bit-era/super-mario-bros-3.js

		url = getPageURL(url);

		// remap the root page URL just for the purposes of this function
		if (url === "/") url = "/index";

		if (!(url in public_api.page_scripts)) {
			$LAB
			.script("/js" + url + ".js")
			.wait(function(){
				if (cb)	setTimeout(cb,0);
			});
		}
		else {
			if (cb)	setTimeout(cb,0);
		}
	}

	function gotoPreviousPage() {
		if (current_page_num > 0) {
			current_page_num--;
			gotoPage(nav[current_page_num]);
		}
	}

	function gotoNextPage() {
		if (current_page_num < (nav.length - 1)) {
			current_page_num++;
			gotoPage(nav[current_page_num]);
		}
	}

	function currentPageNum() {
		return current_page_num;
	}

	function pageCount() {
		return nav.length;
	}

	function pageReady() {

		// initialize later if mobile for better performance
		if(isMobile){
			public_api.page_scripts[
				(current_page_url === "/" ? "/index" : current_page_url)
			].init();
		}

		public_api.page_scripts[
			(current_page_url === "/" ? "/index" : current_page_url)
		].ready();

		setMobileCardToggle();
	}

	// ******************

	function getPageHTML(url,data) {
		// render page with 'grips' engine
		return public_api.grips.render(url + "#page",data);
	}

	function getPageContentHTML(url,data) {
		// render page with 'grips' engine
		return public_api.grips.render(url + "#content",data);
	}

	function getPageCopyHTML(url,data) {
		// render game-copy partial with 'grips' engine
		return public_api.grips.render(url + "#article-wrapper",data);
	}

	function recognize(url) {
		url = getPageURL(url);

		if (url in public_api.grips.collections) {
			return url;
		}
		else {
			return false;
		}
	}

	function trackPage(label) {
		if (typeof _gaq !== 'undefined') {
			try {
				_gaq.push(['_trackEvent', "Page", label]);
				// console.log(label + ' tracked');
			} catch(err){
				// console.log(label + ' not tracked');
			};
		}
	}

	context = context || {};

	var $ = context.$ || {},
		$LAB = context.$LAB || {},
		History = context.History || {},

		current_page_url,
		current_page_num,

		public_api,

		nav = [],
		page_title
	;

	public_api = {
		// browser-only stuff
		siteInit: siteInit,
		gotoPage: gotoPage,
		highlightPageNav: highlightPageNav,
		fetchPageScript: fetchPageScript,
		gotoPreviousPage: gotoPreviousPage,
		gotoNextPage: gotoNextPage,
		currentPageNum: currentPageNum,
		pageCount: pageCount,
		pageReady: pageReady,
		page_scripts: {},

		// used both in browser and on server
		getPageHTML: getPageHTML,
		getPageContentHTML: getPageContentHTML,
		getPageCopyHTML: getPageCopyHTML,
		recognize: recognize
	};


	// initialize the currently loaded page's scripts
	if (context && context.location) {
		current_page_url = getPageURL(context.document.location.href.toString());
		// load and run script for current page
		fetchPageScript(current_page_url,function(){
			public_api.page_scripts[
				(current_page_url === "/" ? "/index" : current_page_url)
			].init();
			public_api.page_scripts[
				(current_page_url === "/" ? "/index" : current_page_url)
			].ready();

			setMobileCardToggle();

		});
	}


	return public_api;
});
