(function(global,Pages){

	var
		THRESHOLD = $("#before_gutter").height(),
		SCROLL_RESET_DURATION = 400,
		TRANSITION_DURATION = 700,
		SCROLL_PAGE_THROTTLE = 600,
		SCROLL_RESET_TIMING = "cubic-bezier(0,.85,0,1)",
		PAGE_TRANSITION_TIMING = "cubic-bezier(0,.59,.28,1)",

		scrolling_enabled = true,
		scrolling = false,
		scrolling_timeout = null,
		scrolling_distance = 0,
		scroll_move_raf = null,
		page_throttle_timeout = null,

		transition_raf = null,
		transitionend_timer = null,

		touch_id,
		orig_touch_y,

		current_page = 0,
		page_count = 0,

		$pages_container = $("#pages_container"),
		$content = $("#content"),
		$before_content = $("#before_content"),
		$after_content = $("#after_content"),

		rAF = global.h5.animationFrame
	;

	function pageThrottleRelease() {
		clearTimeout(page_throttle_timeout);
		page_throttle_timeout = null;
	}

	function pageSwitchComplete() {
		clearTimeout(transitionend_timer);
		transitionend_timer = null;
		$pages_container.unbind("transitionend webkitTransitionEnd oTransitionEnd");

		if ($content.hasClass("after_content")) {
			$content.removeClass("after_content").addClass("content");
			$after_content.removeClass("content").addClass("after_content");

			Pages.pageReady();

			pageThrottleRelease();
			page_throttle_timeout = setTimeout(pageThrottleRelease,SCROLL_PAGE_THROTTLE);
		}
		else if ($content.hasClass("before_content")) {
			$content.removeClass("before_content").addClass("content");
			$before_content.removeClass("content").addClass("before_content");

			Pages.pageReady();

			pageThrottleRelease();
			page_throttle_timeout = setTimeout(pageThrottleRelease,SCROLL_PAGE_THROTTLE);
		}

		pagesContainerResetImmediate();
	}

	function switchPage(toPage,pageContent,pageCopy) {
		var tmp;

		if (toPage >= 0 && toPage <= (page_count - 1) && toPage !== current_page) {
			if (!scrolling_enabled) {
				pageSwitchComplete();
			}

			// going down a page
			if (toPage < current_page) {
				// pop in the next page content, swap id's and pointers
				$content.attr({ id: "before_content" });
				$before_content.attr({ id: "content" }).html(pageContent);
				$after_content.html(''); //Added this to solve problem of duplicate IDs
				tmp = $content;
				$content = $before_content;
				$before_content = tmp;

				$pages_container.css({
					"top": THRESHOLD + "px"
				});

				if (toPage !== 0 && current_page !== 0) {
					$(".article-wrapper .game-block-inner").addClass("fade-out");
					setTimeout(function(){
						$(".article-wrapper .game-block-inner").html(pageCopy);
						// NOTE: have to let the <h1> be painted (invisible) first,
						// before we can fade the game-copy back to visible,
						// otherwise the <h1> will not fade but pop in immediately
						rAF.queueAfter(function(){
							$(".article-wrapper .game-block-inner").removeClass("fade-out");
						});
					},TRANSITION_DURATION / 2);
				}
				else if (current_page !== 0) {
					setTimeout(function(){
						$(".article-wrapper .game-block-inner").html(pageCopy);
					},TRANSITION_DURATION / 2);
				}
				else {
					$(".article-wrapper .game-block-inner").html(pageCopy);
				}

				transition_raf = rAF.queueAfter(function(){
					transition_raf = null;

					$pages_container.css({
						"transform": "translateY(100%)",
						"-webkit-transform": "translateY(100%)",
						"transition": "transform " + TRANSITION_DURATION + "ms " + PAGE_TRANSITION_TIMING,
						"-webkit-transition": "-webkit-transform " + TRANSITION_DURATION + "ms " + PAGE_TRANSITION_TIMING
					});

					$pages_container.bind("transitionend webkitTransitionEnd oTransitionEnd",pageSwitchComplete);
					transitionend_timer = setTimeout(pageSwitchComplete,TRANSITION_DURATION + 10);
				});
			}
			else {
				// pop in the next page content, swap id's and pointers
				$content.attr({ id: "after_content" });
				$after_content.attr({ id: "content" }).html(pageContent);
				$before_content.html(''); //Added this to solve problem of duplicate IDs
				tmp = $content;
				$content = $after_content;
				$after_content = tmp;

				$pages_container.css({
					"top": "-" + THRESHOLD + "px"
				});

				if (toPage !== 0 && current_page !== 0) {
					$(".article-wrapper .game-block-inner").addClass("fade-out");
					setTimeout(function(){
						$(".article-wrapper .game-block-inner").html(pageCopy);
						// NOTE: have to let the <h1> be painted (invisible) first,
						// before we can fade the game-copy back to visible,
						// otherwise the <h1> will not fade but pop in immediately
						rAF.queueAfter(function(){
							$(".article-wrapper .game-block-inner").removeClass("fade-out");
						});
					},TRANSITION_DURATION / 2);
				}
				else if (current_page !== 0) {
					setTimeout(function(){
						$(".article-wrapper .game-block-inner").html(pageCopy);
					},TRANSITION_DURATION / 2);
				}
				else {
					$(".article-wrapper .game-block-inner").html(pageCopy);
				}

				transition_raf = rAF.queueAfter(function(){
					transition_raf = null;

					$pages_container.css({
						"transform": "translateY(-100%)",
						"-webkit-transform": "translateY(-100%)",
						"transition": "transform " + TRANSITION_DURATION + "ms " + PAGE_TRANSITION_TIMING,
						"-webkit-transition": "-webkit-transform " + TRANSITION_DURATION + "ms " + PAGE_TRANSITION_TIMING
					});

					$pages_container.bind("transitionend webkitTransitionEnd oTransitionEnd",pageSwitchComplete);
					transitionend_timer = setTimeout(pageSwitchComplete,TRANSITION_DURATION+10);
				});
			}

			scrolling_enabled = false;
			current_page = toPage;
		}
	}

	function updateScroll() {
		scroll_move_raf = rAF.queue(updateScroll);
		if (
			// scrolling up?
			scrolling_distance > 0 &&
			// previous page to show?
			current_page > 0
		) {
			if (Math.abs(scrolling_distance) >= THRESHOLD) {
				resetScroll(/*ignoreElements=*/true);
				scrolling_enabled = false;
				Pages.gotoPreviousPage();
			}
			else {
				$pages_container.css({
					"top": scrolling_distance + "px",
					"transform": "translateY(0%)",
					"-webkit-transform": "translateY(0%)",
					"transition": "",
					"-webkit-transition": ""
				});
			}
		}
		else if (
			// scrolling down?
			scrolling_distance < 0 &&
			// next page to show?
			current_page < (page_count - 1)
		) {
			if (Math.abs(scrolling_distance) >= THRESHOLD) {
				resetScroll(/*ignoreElements=*/true);
				scrolling_enabled = false;
				Pages.gotoNextPage();
			}
			else {
				$pages_container.css({
					"top": scrolling_distance + "px",
					"transform": "translateY(0%)",
					"-webkit-transform": "translateY(0%)",
					"transition": "",
					"-webkit-transition": ""
				});
			}
		}
	}

	function pagesContainerResetImmediate() {
		var i;

		clearTimeout(transitionend_timer);
		transitionend_timer = null;
		$pages_container.unbind("transitionend webkitTransitionEnd oTransitionEnd");

		if (scroll_move_raf) {
			rAF.cancel(scroll_move_raf);
			scroll_move_raf = null;
		}
		if (transition_raf) {
			rAF.cancel(transition_raf);
			transition_raf = null;
		}

		$pages_container.css({
			"top": "0px",
			"transform": "translateY(0px)",
			"-webkit-transform": "translateY(0px)",
			"transition": "",
			"-webkit-transition": ""
		});

		scrolling_enabled = true;
	}

	function resetScroll(ignoreElements) {
		clearTimeout(scrolling_timeout);
		scrolling_timeout = null;
		rAF.cancel(scroll_move_raf);
		scroll_move_raf = null;

		scrolling_distance = 0;
		touch_id = null;
		orig_touch_y = null;

		if (ignoreElements !== true) {
			scrolling_enabled = false;

			$pages_container.css({
				"top": "0px",
				"transform": "translateY(0px)",
				"-webkit-transform": "translateY(0px)",
				"transition": "top " + SCROLL_RESET_DURATION + "ms " + SCROLL_RESET_TIMING,
				"-webkit-transition": "top " + SCROLL_RESET_DURATION + "ms " + SCROLL_RESET_TIMING
			});

			$pages_container.bind("transitionend webkitTransitionEnd oTransitionEnd",pagesContainerResetImmediate);
			transitionend_timer = setTimeout(pagesContainerResetImmediate,SCROLL_RESET_DURATION+10);
		}
	}



	// mouse
	$(document).bind("mousewheel",function(evt,d,dx,dy){
		var $target = $(evt.target);
		// allow certain marked elements to use native scrolling
		if ($target.is("[data-native-scrollable=\"yes\"]") || $target.closest("[data-native-scrollable=\"yes\"]").length > 0) {
			return;
		}

		evt.preventDefault();
		evt.stopImmediatePropagation();

		if (scrolling_timeout) {
			clearTimeout(scrolling_timeout);
			scrolling_timeout = null;
		}

		// are we throttling between page changes?
		// NOTE: prevents ugly accidental multiple-page changes
		// with a single scroll action
		if (page_throttle_timeout) {
			scrolling_distance = 0;
			resetScroll(/*ignoreElements=*/true);
			pagesContainerResetImmediate();
			return;
		}

		if (scrolling_enabled &&
			(
				(
					dy > 0 &&
					current_page > 0
				) ||
				(
					dy < 0 &&
					current_page < (page_count - 1)
				)
			)
		) {
			scrolling_timeout = setTimeout(resetScroll,250);
			if (!scroll_move_raf) {
				scroll_move_raf = rAF.queue(updateScroll);
			}

			scrolling_distance += dy;
		}
	});



	var touch_timeout;
	var swipeHappening = false;
	var pointerEnabled = window.navigator.msPointerEnabled; // IE10
	var touchEnabled = "ontouchend" in document ? true : false // non IE10 touch

	// touch
	function identifiedTouch(touchList,touchID) {
		var i;
		for (i=0; i<touchList.length; i++) {
			if (touchList[i].identifier === touchID) return touchList[i];
		}
		return touchList[0];
	}

	$(document).bind("touchstart MSPointerDown",function(evt){
		var $target = $(evt.target);
		// allow certain marked elements to use native scrolling
		if ($target.is("[data-native-scrollable=\"yes\"]") || $target.closest("[data-native-scrollable=\"yes\"]").length > 0) {
			return;
		}

		swipeHappening  = false;

		if (scrolling_enabled && touch_id == null) {

			// wait to see if a quick click or a swipe
			touch_timeout = setTimeout(function(){
				swipeHappening = true;
			},350);

		}

		var data = touchEnabled ? evt.originalEvent.touches[0] : evt.originalEvent;
		if(data===undefined){
			data = evt.originalEvent.changedTouches[0];
		}

		touch_id = data.identifier;
		if(!touch_id){ // IE
			var pointerObj = data;
			touch_id = (typeof pointerObj.identifier != 'undefined') ? pointerObj.identifier : (typeof pointerObj.pointerId != 'undefined') ? pointerObj.pointerId : 1;
		}
		orig_touch_y = pointerEnabled ? data.clientY : data.screenY;

	});
	$(document).bind("touchend MSPointerUp",function(evt){
		var $target = $(evt.target);
		// allow certain marked elements to use native scrolling
		if ($target.is("[data-native-scrollable=\"yes\"]") || $target.closest("[data-native-scrollable=\"yes\"]").length > 0) {
			return;
		}

		// if longer than 350ms between touchstart and touchend, then we are swipping, otherwise allow click events
		if(swipeHappening){

			evt.preventDefault();
			evt.stopImmediatePropagation();

		}else{
			clearTimeout(touch_timeout);
			swipeHappening  = false;
		}
		var touchesArray = touchEnabled ? evt.originalEvent.touches : [evt.originalEvent];

		if (
			// still a touch event going on?
			touch_id !== null &&
			// no more touches?

			touchesArray.length === 0

		) {
			resetScroll();
		}

	});

	$(document).bind("touchmove MSPointerMove",function(evt){

		var $target = $(evt.target);
		// allow certain marked elements to use native scrolling
		if ($target.is("[data-native-scrollable=\"yes\"]") || $target.closest("[data-native-scrollable=\"yes\"]").length > 0) {
			return;
		}

		var touch;

		var data = touchEnabled ? evt.originalEvent.touches[0] : evt.originalEvent;
		if(data===undefined){
			data = evt.originalEvent.changedTouches[0];
		}

		evt.preventDefault();
		evt.stopImmediatePropagation();

		if (scrolling_timeout) {
			clearTimeout(scrolling_timeout);
			scrolling_timeout = null;
		}

		// are we throttling between page changes?
		// NOTE: prevents ugly accidental multiple-page changes
		// with a single scroll action
		if (page_throttle_timeout) {
			scrolling_distance = 0;
			resetScroll(/*ignoreElements=*/true);
			pagesContainerResetImmediate();
			return;
		}

		if (scrolling_enabled) {
			if (touch_id == null) {
				touch_id = data.identifier;
				orig_touch_y = pointerEnabled ? data.clientY : data.screenY;
			}

			scrolling_timeout = setTimeout(resetScroll,200);
			if (!scroll_move_raf) {
				scroll_move_raf = rAF.queue(updateScroll);
			}

			var touchesList = evt.originalEvent.changedTouches ? evt.originalEvent.changedTouches : [evt.originalEvent];
			touch = identifiedTouch(touchesList,touch_id);

			if(pointerEnabled){
				scrolling_distance = touch.clientY - orig_touch_y;
			}else{
				scrolling_distance = touch.screenY - orig_touch_y;
			}
		}
	});

	// keyboard
	$(document).bind("keydown",function(evt){
		if (evt.which === 38) {
			if (!scrolling_enabled) {
				pageSwitchComplete();
			}
			if (current_page > 0) {
				Pages.gotoPreviousPage();
			}
			evt.preventDefault();
			evt.stopImmediatePropagation();
		}
		else if (evt.which === 40) {
			if (!scrolling_enabled) {
				pageSwitchComplete();
			}
			if (current_page < (page_count - 1)) {
				Pages.gotoNextPage();
			}
			evt.preventDefault();
			evt.stopImmediatePropagation();
		}
	});

	function setPageNum(pageNum) {
		current_page = pageNum;
	}

	function setPageCount(pageCount) {
		page_count = pageCount;
	}

	function disable() {
		scrolling_enabled = false;
	}

	function enable() {
		scrolling_enabled = true;
	}


	global.ScrollPager = {
		switchPage: switchPage,
		setPageNum: setPageNum,
		setPageCount: setPageCount,
		enable: enable,
		disable: disable
	};

})(window,Pages);
