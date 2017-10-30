var PullToRefresh = (function () {
  var _ptrMarkup = function () { return "<div class=\"__PREFIX__box\"><div class=\"__PREFIX__content\"><div class=\"__PREFIX__icon\"></div><div class=\"__PREFIX__text\"></div></div></div>"; };

  var _ptrStyles = function () { return ".__PREFIX__ptr {\n __PULLWRAPBG__\n  __PULLWRAPBOXSHADOW__\n  pointer-events: none;\n  font-size: 0.85em;\n  font-weight: bold;\n  top: 0;\n  height: 0;\n  transition: height 0.3s, min-height 0.3s;\n  text-align: center;\n  width: 100%;\n  overflow: hidden;\n  display: flex;\n  align-items: flex-end;\n  align-content: stretch;\n}\n.__PREFIX__box {\n  padding: 10px;\n  flex-basis: 100%;\n}\n.__PREFIX__pull {\n  transition: none;\n}\n.__PREFIX__text {\n  margin-top: .33em;\n  color: rgba(252, 252, 252, 0.8);\n}\n.__PREFIX__icon {\n  color: rgba(252, 252, 252, 0.8);\n  transition: transform .3s;\n}\n.__PREFIX__top {\n  touch-action: pan-x pan-down pinch-zoom;\n}\n.__PREFIX__release .__PREFIX__icon {\n  transform: rotate(180deg);\n}\n .__PREFIX__ptr-after{\n box-shadow: none !important;\n __PULLAFTERBG__\n}"; };

  /* eslint-disable import/no-unresolved */

  var _SETTINGS = {};

  var _defaults = {
    distThreshold: 70,
    distMax: 90,
    distReload: 80,
    bodyOffset: 20,
    pullAreaBg: '',
    elasticityAreaBg: '',
    mainElement: 'body',
    triggerElement: 'body',
    ptrElement: '.ptr',
    ptrAfterElement: '.ptr-after',
    classPrefix: 'ptr--',
    cssProp: 'min-height',
    iconArrow: '&#8675;',
    iconRefreshing: '&hellip;',
    instructionsPullToRefresh: 'Pull down to refresh',
    instructionsReleaseToRefresh: 'Release to refresh',
    instructionsRefreshing: 'Refreshing',
    refreshTimeout: 500,
    getMarkup: _ptrMarkup,
    getStyles: _ptrStyles,
    onInit: function () { },
    onRefresh: function () { return location.reload(); },
    onRefreshAfter: function () { return location.reload(); },
    resistanceFunction: function (t) { return Math.min(1, t / 2.5); },
    shouldPullToRefresh: function () { return !window.scrollY; },
    shouldUpToElasticity: function () { return !window.scrollY; },
    onlyElasticity: false,
    otherElmHeight: 0
  };

  var pullStartY = null;
  var pullMoveY = null;
  var dist = 0;
  var distResisted = 0;

  var _state = 'pending';
  var _setup = false;
  var _enable = false;
  var _timeout;

  var canPull = false;
  var canElasticity = false;

  var supportsPassive = false;

  try {
    window.addEventListener('test', null, {
      get passive() {
        supportsPassive = true;
      },
    });
  } catch (e) {
    // do nothing
  }

  function _update() {
    var onlyElasticity = _SETTINGS.onlyElasticity;
    if (!onlyElasticity) {
      var classPrefix = _SETTINGS.classPrefix;
      var ptrElement = _SETTINGS.ptrElement;
      var ptrAfterElement = _SETTINGS.ptrAfterElement;
      var iconArrow = _SETTINGS.iconArrow;
      var iconRefreshing = _SETTINGS.iconRefreshing;
      var instructionsRefreshing = _SETTINGS.instructionsRefreshing;
      var instructionsPullToRefresh = _SETTINGS.instructionsPullToRefresh;
      var instructionsReleaseToRefresh = _SETTINGS.instructionsReleaseToRefresh;

      var iconEl = ptrElement.querySelector(("." + classPrefix + "icon"));
      var textEl = ptrElement.querySelector(("." + classPrefix + "text"));

      if (_state === 'refreshing') {
        iconEl.innerHTML = iconRefreshing;
      } else {
        iconEl.innerHTML = iconArrow;
      }

      if (_state === 'releasing') {
        textEl.innerHTML = instructionsReleaseToRefresh;
      }

      if (_state === 'pulling' || _state === 'pending') {
        textEl.innerHTML = instructionsPullToRefresh;
      }

      if (_state === 'refreshing') {
        textEl.innerHTML = instructionsRefreshing;
      }
    }
  }

  function _setupEvents() {
    function onReset() {
      var cssProp = _SETTINGS.cssProp;
      var ptrElement = _SETTINGS.ptrElement;
      var classPrefix = _SETTINGS.classPrefix;

      ptrElement.classList.remove((classPrefix + "refresh"));
      ptrElement.style[cssProp] = '0px';

      _state = 'pending';
    }

    function _onTouchStart(e) {
      var shouldPullToRefresh = _SETTINGS.shouldPullToRefresh;
      var shouldUpToElasticity = _SETTINGS.shouldUpToElasticity;
      var triggerElement = _SETTINGS.triggerElement;

      if (!triggerElement.contains(e.target)) {
        return;
      }

      canPull = false;
      canElasticity = false;
      if (shouldPullToRefresh() || shouldUpToElasticity()) {
        pullStartY = e.touches[0].screenY;
        if (shouldPullToRefresh() && !shouldUpToElasticity()) {
          canPull = true;
        } else if (!shouldPullToRefresh() && shouldUpToElasticity()) {
          canElasticity = true;
        } else {
          canPull = true;
          canElasticity = true;
        }
      }

      if (_state !== 'pending') {
        return;
      }
      if (triggerElement !== document.body) {
        triggerElement.style.transition = '';
      }

      clearTimeout(_timeout);

      _enable = triggerElement.contains(e.target);
      _state = 'pending';
      _update();
    }

    function _onTouchMove(e) {
      var cssProp = _SETTINGS.cssProp;
      var classPrefix = _SETTINGS.classPrefix;
      var distMax = _SETTINGS.distMax;
      var distThreshold = _SETTINGS.distThreshold;
      var ptrElement = _SETTINGS.ptrElement;
      var ptrAfterElement = _SETTINGS.ptrAfterElement;
      var triggerElement = _SETTINGS.triggerElement;
      var resistanceFunction = _SETTINGS.resistanceFunction;
      var onlyElasticity = _SETTINGS.onlyElasticity;

      if (!triggerElement.contains(e.target)) {
        return;
      }
      
      if (!pullStartY) {
        if (canPull || canElasticity) {
          pullStartY = e.touches[0].screenY;
        }
      } else {
        pullMoveY = e.touches[0].screenY;
      }

      if (!_enable || _state === 'refreshing') {
        if (canPull && pullStartY < pullMoveY) {
          e.preventDefault();
        }
        if (canElasticity && pullStartY > pullMoveY) {
          e.preventDefault();
        }
        return;
      }

      if (pullStartY && pullMoveY) {
        dist = pullMoveY - pullStartY;
      }

      if (canPull && dist > 0) {
        if (_state === 'pending') {
          ptrElement.classList.add((classPrefix + "pull"));
          _state = 'pulling';
          _update();
        }

        e.preventDefault();

        ptrElement.style[cssProp] = distResisted + "px";

        if (!onlyElasticity) {
          distResisted = resistanceFunction(dist / distThreshold) * Math.min(distMax, dist);
        } else {
          let disRatio = dist / 200;
          distResisted = Math.min(1, dist / 80 / 6.5) * Math.min(100, dist) * 0.8;
        }

        if (!onlyElasticity) {
          if (_state === 'pulling' && distResisted > distThreshold) {
            ptrElement.classList.add((classPrefix + "release"));
            _state = 'releasing';
            _update();
          }

          if (_state === 'releasing' && distResisted < distThreshold) {
            ptrElement.classList.remove((classPrefix + "release"));
            _state = 'pulling';
            _update();
          }
        }
      } else if (canElasticity && dist < 0) {
        if (triggerElement !== document.body) {
          if (_state === 'pending' && onlyElasticity) {
            ptrAfterElement.classList.add((classPrefix + "pull"));
            _state = 'pulling';
            _update();
          }

          e.preventDefault();

          triggerElement.style.transform = 'translate3d(0px, ' + (- distResisted) + 'px, 0px)';

          distResisted = Math.abs(dist) * 0.2;
        }
      }
    }

    function _onTouchEnd(e) {
      var ptrElement = _SETTINGS.ptrElement;
      var ptrAfterElement = _SETTINGS.ptrAfterElement;
      var triggerElement = _SETTINGS.triggerElement;
      var onRefresh = _SETTINGS.onRefresh;
      var onRefreshAfter = _SETTINGS.onRefreshAfter;
      var refreshTimeout = _SETTINGS.refreshTimeout;
      var distThreshold = _SETTINGS.distThreshold;
      var distReload = _SETTINGS.distReload;
      var cssProp = _SETTINGS.cssProp;
      var classPrefix = _SETTINGS.classPrefix;
      var onlyElasticity = _SETTINGS.onlyElasticity;

      if (!triggerElement.contains(e.target)) {
        return;
      }

      if (_state === 'releasing' && distResisted > distThreshold) {
        _state = 'refreshing';

        ptrElement.style[cssProp] = distReload + "px";
        ptrElement.classList.add((classPrefix + "refresh"));

        _timeout = setTimeout(function () {
          var retval = onRefresh(onReset);

          if (retval && typeof retval.then === 'function') {
            retval.then(function (thenReturn) {
              onReset();
              return onRefreshAfter(thenReturn);
            });
          }

          if (!retval && !onRefresh.length) {
            onReset();
            onRefreshAfter();
          }
        }, refreshTimeout);
      } else {
        if (_state === 'refreshing') {
          return;
        }

        ptrElement.style[cssProp] = '0px';
        if (triggerElement !== document.body) {
          triggerElement.style.transition = '0.3s ease';
          triggerElement.style.transform = 'translate3d(0px, 0px, 0px)';
        }

        _state = 'pending';
      }

      _update();

      ptrElement.classList.remove((classPrefix + "release"));
      ptrElement.classList.remove((classPrefix + "pull"));
      if (onlyElasticity) {
        ptrAfterElement.classList.remove((classPrefix + "release"));
        ptrAfterElement.classList.remove((classPrefix + "pull"));
      }

      pullStartY = pullMoveY = null;
      dist = distResisted = 0;
    }

    function _onScroll() {
      var mainElement = _SETTINGS.mainElement;
      var classPrefix = _SETTINGS.classPrefix;
      var shouldPullToRefresh = _SETTINGS.shouldPullToRefresh;

      mainElement.classList.toggle((classPrefix + "top"), shouldPullToRefresh());
    }

    window.addEventListener('touchend', _onTouchEnd);
    window.addEventListener('touchstart', _onTouchStart);
    window.addEventListener('touchmove', _onTouchMove, supportsPassive
      ? { passive: _SETTINGS.passive || false }
      : undefined);

    window.addEventListener('scroll', _onScroll);

    // Store event handlers to use for teardown later
    return {
      onTouchStart: _onTouchStart,
      onTouchMove: _onTouchMove,
      onTouchEnd: _onTouchEnd,
      onScroll: _onScroll,
    };
  }

  function _run() {
    var mainElement = _SETTINGS.mainElement;
    var triggerElement = _SETTINGS.triggerElement;
    var getMarkup = _SETTINGS.getMarkup;
    var getStyles = _SETTINGS.getStyles;
    var classPrefix = _SETTINGS.classPrefix;
    var onInit = _SETTINGS.onInit;
    var pullAreaBg = _SETTINGS.pullAreaBg;
    var elasticityAreaBg = _SETTINGS.elasticityAreaBg;
    var onlyElasticity = _SETTINGS.onlyElasticity;
    var otherElmHeight = _SETTINGS.otherElmHeight;

    if (!document.querySelector(("." + classPrefix + "ptr"))) {
      var ptr = document.createElement('div');
      var ptrAfter = document.createElement('div');

      if (mainElement !== document.body) {
        mainElement.parentNode.insertBefore(ptr, mainElement);
      } else {
        document.body.insertBefore(ptr, document.body.firstChild);
      }
      ptrAfter.style.position = 'absolute';
      ptrAfter.style.top = otherElmHeight + 'px';
      ptrAfter.style.zIndex = -1;
      ptrAfter.style.height = ($(window).height() - Number(otherElmHeight)) + 'px';
      document.body.appendChild(ptrAfter);
      if (triggerElement !== document.body) {
        triggerElement.style.transition = '';
        triggerElement.style.transform = 'translate3d(0px, 0px, 0px)';
      }

      if (!onlyElasticity) {
        ptr.innerHTML = getMarkup()
          .replace(/__PREFIX__/g, classPrefix);
      }

      ptr.classList.add((classPrefix + "ptr"));
      ptrAfter.classList.add(classPrefix + "ptr");
      ptrAfter.classList.add(classPrefix + "ptr-after");
      _SETTINGS.ptrAfterElement = ptrAfter;

      _SETTINGS.ptrElement = ptr;
    }

    // Add the css styles to the style node, and then
    // insert it into the dom
    // ========================================================
    var styleEl;
    if (!document.querySelector('#pull-to-refresh-js-style')) {
      styleEl = document.createElement('style');
      styleEl.setAttribute('id', 'pull-to-refresh-js-style');

      document.head.appendChild(styleEl);
    } else {
      styleEl = document.querySelector('#pull-to-refresh-js-style');
    }

    styleEl.textContent = getStyles()
      .replace(/__PREFIX__/g, classPrefix)
      .replace(/\s+/g, ' ');
    if (!onlyElasticity && pullAreaBg && pullAreaBg != '') {
      styleEl.textContent = styleEl.textContent.replace(/__PULLWRAPBG__/g, 'background: ' + pullAreaBg + ';')
    } else {
      styleEl.textContent = styleEl.textContent.replace(/__PULLWRAPBG__/g, '')
    }
    if (elasticityAreaBg && elasticityAreaBg != '') {
      styleEl.textContent = styleEl.textContent.replace(/__PULLAFTERBG__/g, 'background: ' + elasticityAreaBg + ' !important;')
    } else {
      styleEl.textContent = styleEl.textContent.replace(/__PULLAFTERBG__/g, 'background: none !important;')
    }
    if (onlyElasticity) {
      styleEl.textContent = styleEl.textContent.replace(/__PULLWRAPBOXSHADOW__/g, '')
    } else {
      styleEl.textContent = styleEl.textContent.replace(/__PULLWRAPBOXSHADOW__/g, 'box-shadow: inset 0 -3px 10px rgba(0, 0, 0, 0.12);')
    }

    if (typeof onInit === 'function') {
      onInit(_SETTINGS);
    }

    return {
      styleNode: styleEl,
      ptrElement: _SETTINGS.ptrElement,
      ptrAfterElement: _SETTINGS.ptrAfterElement
    };
  }

  var pulltorefresh = {
    init: function init(options) {
      if (options === void 0) options = {};

      var handlers;
      Object.keys(_defaults).forEach(function (key) {
        _SETTINGS[key] = options[key] || _defaults[key];
      });

      var methods = ['mainElement', 'ptrElement', 'triggerElement'];
      methods.forEach(function (method) {
        if (typeof _SETTINGS[method] === 'string') {
          _SETTINGS[method] = document.querySelector(_SETTINGS[method]);
        }
      });

      if (!_setup) {
        handlers = _setupEvents();
        _setup = true;
      }

      var ref = _run();
      var styleNode = ref.styleNode;
      var ptrElement = ref.ptrElement;

      return {
        destroy: function destroy() {
          // Teardown event listeners
          window.removeEventListener('touchstart', handlers.onTouchStart);
          window.removeEventListener('touchend', handlers.onTouchEnd);
          window.removeEventListener('touchmove', handlers.onTouchMove, supportsPassive
            ? { passive: _SETTINGS.passive || false }
            : undefined);
          window.removeEventListener('scroll', handlers.onScroll);

          // Remove ptr element and style tag
          styleNode.parentNode.removeChild(styleNode);
          ptrElement.parentNode.removeChild(ptrElement);

          // Enable setupEvents to run again
          _setup = false;

          // null object references
          handlers = null;
          styleNode = null;
          ptrElement = null;
          _SETTINGS = {};
        },
      };
    },
  };

  return pulltorefresh;

}());