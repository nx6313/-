!function (win) {
    var oHtml = win.document.documentElement; // 获取html
    var timer = null;

    function changeRem() {
        var width = oHtml.getBoundingClientRect().width; // 获取设备的宽度，IE浏览器要做兼容处理
        if (width > 540) {
            width = 540;
        }
        var rem = width / 10;
        oHtml.style.fontSize = rem + "px"; // 设置根目录下字体大小
    }

    win.addEventListener("resize", function () {
        clearTimeout(timer);
        timer = setTimeout(changeRem, 200);
    });

    changeRem();
}(window);

/**
 * 页面初始化
 * @param {* 页面配置参数 } pageParams 
 */
var initAppPage = function (pageParams) {
    var pageHead = document.getElementsByTagName('head')[0];
    let iconFontLink = document.createElement('link');
    iconFontLink.rel = "stylesheet";
    iconFontLink.href = "http://at.alicdn.com/t/font_447863_91w2p67w1nzy3nmi.css";
    pageHead.appendChild(iconFontLink);

    let baseParams = {
        titleBarFlag: true, barTitle: '标题栏', leftIcon: undefined, rightIcon: undefined, leftMenus: null, leftMenuFns: null,
        leftIconFn: function () { }, rightIconFn: function () { }, mainContentFull: false,
        bgColor: '#FBFBFB', refFlag: false, elasticityFlag: true,
        pullAreaBg: '#878787', elasticityAreaBg: '#E6E6E6', refFn: function () { }, refAfterFn: function () { },
        formRender: false, elmRender: false
    };
    if ($.isPlainObject(pageParams)) {
        $.extend(baseParams, pageParams);
    }

    $('body').animateCss('fadeIn');

    let pageTitleBarHtml = '';
    if (baseParams.titleBarFlag) {
        pageTitleBarHtml = initTitleBar({
            title: baseParams.barTitle,
            leftIcon: baseParams.leftIcon,
            rightIcon: baseParams.rightIcon
        });
        pageTitleBarHtml += '<div class="titleBarPlaceholder"></div>';
    }
    let bodyAllHtml = $('body').html();
    $('body').html(pageTitleBarHtml +
        '<div id="pageWrap"><div id="pullRefWrap" class="pullRefWrap">' +
        '<div id="mainContent" class="mainContent" style="position: relative; z-index: 100;">' + bodyAllHtml + '</div>' +
        '</div></div>');
    $('body').show();
    if (baseParams.formRender) {
        var form = layui.form;
        form.render();
    }
    if (baseParams.elmRender) {
        var element = layui.element;
        element.init();
    }
    $('.mainContent').css('background', baseParams.bgColor);

    fullPullRefWrapHeight(baseParams.mainContentFull);
    if (baseParams.elasticityFlag) {
        initPullRef({
            refFlag: baseParams.refFlag,
            pullAreaBg: baseParams.pullAreaBg,
            elasticityAreaBg: baseParams.elasticityAreaBg,
            refFn: baseParams.refFn,
            refAfterFn: baseParams.refAfterFn
        });
    }

    // 解析左侧菜单项
    let leftMenuItemHtml = '';
    if ($.isArray(baseParams.leftMenus)) {
        leftMenuItemHtml += '<ul>';
        $.each(baseParams.leftMenus, function (leftMenuIndex, leftMenuVal) {
            if (leftMenuVal.indexOf('icon-') >= 0) {
                let menuItemAr = leftMenuVal.split(':');
                leftMenuItemHtml += '<li class="ripple">' + '<i class="leftMenuItemIcon iconfont ' + menuItemAr[0] + '"></i>' + menuItemAr[1] + '</li>';
            } else {
                leftMenuItemHtml += '<li class="ripple">' + leftMenuVal + '</li>';
            }
        });
        leftMenuItemHtml += '</ul>';
    }

    // 绑定事件
    if ((baseParams.leftIcon || typeof baseParams.leftIcon === 'undefined') &&
        baseParams.leftIconFn && typeof baseParams.leftIconFn === 'function') {
        $('.titleBar').on('click', 'span:eq(0)', function () {
            baseParams.leftIconFn();
        });
    }
    if ((baseParams.rightIcon || typeof baseParams.rightIcon === 'undefined') &&
        baseParams.rightIconFn && typeof baseParams.rightIconFn === 'function') {
        if (typeof baseParams.rightIcon === 'undefined' && leftMenuItemHtml !== '') {
            // 默认事件
            $('.titleBar').on('click', 'span:eq(2)', function () {
                if ($('.leftMenuBg').length == 0) {
                    let leftMenuHtml = '<div class="screenPopBg leftMenuBg">' +
                        '<div class="leftMenuWrap animated flipInX">' + leftMenuItemHtml +
                        '</div></div>';
                    $('body').append(leftMenuHtml);
                    $('.leftMenuBg').animateCss('fadeIn');
                    $('.leftMenuBg').on('click', function (e) {
                        if (!document.getElementsByClassName('leftMenuWrap')[0].contains(e.target)) {
                            $('.leftMenuBg').fadeOut(700, function () {
                                $('.leftMenuBg').remove();
                            });
                            $('.leftMenuWrap').removeClass('flipInX');
                            $('.leftMenuWrap').animateCss('flipOut', true);
                        }
                    });
                    // 为菜单项绑定事件
                    if ($.isArray(baseParams.leftMenuFns)) {
                        $.each(baseParams.leftMenuFns, function (leftMenuFnIndex, leftMenuFn) {
                            $('.leftMenuWrap').on('click', 'li:eq(' + leftMenuFnIndex + ')', function () {
                                $(this).animateCss('rippleria');
                                let menuItemCall = leftMenuFn();
                                if (typeof menuItemCall !== 'undefined') {
                                    return menuItemCall;
                                }
                                $('.leftMenuBg').fadeOut(700, function () {
                                    $('.leftMenuBg').remove();
                                });
                                $('.leftMenuWrap').removeClass('flipInX');
                                $('.leftMenuWrap').animateCss('flipOut', true);
                            });
                        });
                    }
                } else {
                    $('.leftMenuBg').fadeOut(700, function () {
                        $('.leftMenuBg').remove();
                    });
                    $('.leftMenuWrap').removeClass('flipInX');
                    $('.leftMenuWrap').animateCss('flipOut', true);
                }
            });
        } else {
            $('.titleBar').on('click', 'span:eq(2)', function () {
                baseParams.rightIconFn();
            });
        }
    }
};

/**
 * 初始化标题栏信息
 * @param {* 标题栏配置参数 } titleBarParams 
 */
var initTitleBar = function (titleBarParams) {
    let baseParams = {
        title: '标题栏', leftIcon: undefined, rightIcon: undefined
    };
    if ($.isPlainObject(titleBarParams)) {
        $.extend(baseParams, titleBarParams);
    }
    let pageTitleBarHtml = '<div class="titleBar flex-r flex-b">' +
        '<span class="titleBarIcon ripple">__TITLEBARLEFT__</span>' +
        '<span class="titleBarName text-press">__TITLENAME__</span>' +
        '<span class="titleBarIcon ripple">__RIGHTBARLEFT__</span>' +
        '</div>';
    if (!baseParams.leftIcon) {
        if (typeof baseParams.leftIcon === 'undefined') {
            pageTitleBarHtml = pageTitleBarHtml.replace(/__TITLEBARLEFT__/g, '<i class="iconfont icon-back"></i>');
        } else {
            pageTitleBarHtml = pageTitleBarHtml.replace(/__TITLEBARLEFT__/g, '');
        }
    } else {
        pageTitleBarHtml = pageTitleBarHtml.replace(/__TITLEBARLEFT__/g, '<i class="iconfont ' + baseParams.leftIcon + '"></i>');
    }
    if (!baseParams.rightIcon) {
        if (typeof baseParams.rightIcon === 'undefined') {
            pageTitleBarHtml = pageTitleBarHtml.replace(/__RIGHTBARLEFT__/g, '<i class="iconfont icon-category"></i>');
        } else {
            pageTitleBarHtml = pageTitleBarHtml.replace(/__RIGHTBARLEFT__/g, '');
        }
    } else {
        pageTitleBarHtml = pageTitleBarHtml.replace(/__RIGHTBARLEFT__/g, '<i class="iconfont ' + baseParams.rightIcon + '"></i>');
    }
    pageTitleBarHtml = pageTitleBarHtml.replace(/__TITLENAME__/g, baseParams.title);
    return pageTitleBarHtml;
};

/**
 * 指定元素占用空间剩余高度
 */
var fullPullRefWrapHeight = function (mainContentFull) {
    if ($('div#pageWrap').length > 0) {
        let screenHeight = $(window).height();
        let titleBarHeight = $('div.titleBar').height();
        if (!titleBarHeight) {
            titleBarHeight = 0;
        }
        $('div#pageWrap').css('top', titleBarHeight + 'px');
        $('div#pageWrap').css('height', (screenHeight - titleBarHeight) + 'px');
        $('div#pullRefWrap').css('height', '100%');
        if (mainContentFull) {
            $('div#mainContent').css('height', '100%');
        }
    }
};

var initPullRef = function (pullRefParams) {
    let baseParams = {
        refFlag: false, pullAreaBg: '#A1CDCD', elasticityAreaBg: '#A1CDCD', refFn: function () { }, refAfterFn: function () { }
    };
    if ($.isPlainObject(pullRefParams)) {
        $.extend(baseParams, pullRefParams);
    }
    PullToRefresh.init({
        mainElement: '.mainContent',
        triggerElement: '.pullRefWrap',
        classPrefix: 'wx-',
        pullAreaBg: baseParams.pullAreaBg,
        elasticityAreaBg: baseParams.elasticityAreaBg,
        instructionsPullToRefresh: '继续下拉',
        instructionsReleaseToRefresh: '释放刷新',
        instructionsRefreshing: '正在刷新',
        iconArrow: '<img src="images/jingyu.png"/>',
        iconRefreshing: '<img src="images/huli.png"/>',
        onRefresh: baseParams.refFn,
        onRefreshAfter: baseParams.refAfterFn,
        onlyElasticity: (!baseParams.refFlag),
        otherElmHeight: $('div.titleBar').height(),
        refreshTimeout: 200,
        shouldPullToRefresh: () => {
            let scrollTop = $('.pullRefWrap').scrollTop();
            if (scrollTop <= 0) {
                return true;
            }
            return false;
        },
        shouldUpToElasticity: () => {
            let scrollTop = $('.pullRefWrap').scrollTop();
            let clientHeight = document.getElementsByClassName('pullRefWrap')[0].clientHeight;
            let scrollHeight = document.getElementsByClassName('pullRefWrap')[0].scrollHeight;
            if (scrollHeight == clientHeight + scrollTop) {
                return true;
            }
            return false;
        }
    });
};

/**
 * 扩展 JQuery 添加动画属性方法
 */
$.fn.extend({
    animateCss: function (animationName, removeFlag) {
        let that = this;
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        let animationEndPromise = new Promise(function (resolve) {
            that.addClass('animated ' + animationName).one(animationEnd, function () {
                resolve('移出属性动画执行完毕');
                $(that).removeClass('animated ' + animationName);
                if (removeFlag) {
                    $(that).remove();
                }
            });
        });
        return animationEndPromise;
    }
});

/**
 * 初始化侧边字母检索
 * @param {* 侧边字母检索区域参数配置 } lspParams 
 */
var initLetterSideSlip = function (lspParams) {
    let baseParams = {
        letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        bgColor: null, letterBgColor: null, domTargetPer: '', initAlpha: .1, showLoading: false, callBack: function (letter) { }
    };
    if ($.isPlainObject(lspParams)) {
        $.extend(baseParams, lspParams);
    }
    let leftLetterHtml = '<div id="letterSlpWrap" class="letterSlpWrap noselect" style="opacity: ' + baseParams.initAlpha + '; __LETTERSLPWRAPBG__">' +
        '<ul class="flex-col flex-a">__LETTERITEMLI__</ul>' +
        '</div>';
    let letterItemLiHtml = '';
    $.each(baseParams.letters, function (letterIndex, letterVal) {
        letterItemLiHtml += '<li style="__LETTERITEMLIBG__">' + letterVal + '</li>';
    });
    leftLetterHtml = leftLetterHtml.replace(/__LETTERITEMLI__/g, letterItemLiHtml);
    if (baseParams.bgColor) {
        leftLetterHtml = leftLetterHtml.replace(/__LETTERSLPWRAPBG__/g, 'background: ' + baseParams.bgColor + ';');
    } else {
        leftLetterHtml = leftLetterHtml.replace(/__LETTERSLPWRAPBG__/g, '');
    }
    if (baseParams.letterBgColor) {
        leftLetterHtml = leftLetterHtml.replace(/__LETTERITEMLIBG__/g, 'background: ' + baseParams.letterBgColor + ';');
    } else {
        leftLetterHtml = leftLetterHtml.replace(/__LETTERITEMLIBG__/g, '');
    }
    if ($('.letterSlpWrap').length == 0) {
        $('body').append(leftLetterHtml);
    }
    // 设置top值及height值
    let screenHeight = $(window).height();
    let titleBarHeight = $('div.titleBar').height();
    let letterSlpWrapTop = 'calc(' + titleBarHeight + 'px + 0.2rem)';
    if (!titleBarHeight) {
        titleBarHeight = 0;
        letterSlpWrapTop = '0.2rem';
    }
    let contentAreaHeight = screenHeight - titleBarHeight;
    $('#letterSlpWrap').css({ top: letterSlpWrapTop, height: 'calc(' + contentAreaHeight + 'px - 0.06rem - 0.06rem - 0.2rem - 0.2rem' + ')' });
    // 初始化字母检索区域值数组
    let letterOffSetTopArr = [];
    let letterLis = $('.letterSlpWrap').find('li');
    let letterLiOffSetMax = $('.pullRefWrap').innerHeight();
    let ageLiMarginHeight = (letterLiOffSetMax - 62 - 8) / baseParams.letters.length;
    $.each(letterLis, function (letterLiIndex, letterLiDom) {
        let letterLiDomOffSetTop = $(letterLiDom).offset().top;
        letterOffSetTopArr.push([letterLiDomOffSetTop, letterLiDomOffSetTop + ageLiMarginHeight]);
    });
    // 绑定事件
    let selectedLetter = '';
    $('.letterSlpWrap').on('touchstart', function (e) {
        $(this).stop(true);
        $(this).animate({
            opacity: 1
        }, 300);
    }).on('touchend', function (e) {
        $(this).find('li').removeClass('moveSelected');
        $('.letterBigTipWrap').remove();
        if (selectedLetter && selectedLetter !== '') {
            if ($('#' + baseParams.domTargetPer + selectedLetter, $('.mainContent')).length == 1) {
                let cOffset = $('.mainContent').offset().top;
                let tOffset = $('#' + baseParams.domTargetPer + selectedLetter, $('.mainContent')).offset().top;
                let pScroll = (tOffset - cOffset) - 10;
                $('.pullRefWrap').stop(true);
                $('.pullRefWrap').animate({ scrollTop: pScroll + 'px' });
            }
            let weLoading = null;
            if (baseParams.showLoading) {
                weLoading = $.toast('数据加载中');
            }
            let callBack = baseParams.callBack(selectedLetter);
            if (callBack && typeof callBack.then === 'function') {
                callBack.then(function () {
                    if (weLoading) {
                        //weLoading.hide();
                    }
                });
            }
            selectedLetter = '';
        }
        $(this).animate({
            opacity: baseParams.initAlpha
        }, 300);
    }).on('touchmove', function (e) {
        if (e.targetTouches.length == 1) {
            let currentMovePageY = e.targetTouches[0].pageY;
            let moveToAboutIndex = numberInAreaArr(letterOffSetTopArr, currentMovePageY);
            if (typeof moveToAboutIndex !== 'undefined' && moveToAboutIndex >= 0) {
                $(this).find('li').removeClass('moveSelected');
                $(this).find('li:eq(' + moveToAboutIndex + ')').addClass('moveSelected');
                let letterTarget = baseParams.letters[moveToAboutIndex];
                selectedLetter = letterTarget;
                let letterBigTipHtml = '<div class="letterBigTipWrap"><span class="letter-press">' + letterTarget + '</span></div>';
                if ($('.letterBigTipWrap').length == 0) {
                    $('body').append(letterBigTipHtml);
                    $('.letterBigTipWrap').animateCss('fadeIn');
                } else {
                    $('.letterBigTipWrap').find('span').text(letterTarget);
                }
            }
        }
    });
};

var numberInAreaArr = function (numberAreaArr, targetNumber) {
    let resultIndex = -1;
    if ($.isArray(numberAreaArr)) {
        $.each(numberAreaArr, function (index, val) {
            if ($.isArray(val)) {
                if ($.isNumeric(val[0]) && Number(val[0]) <= Number(targetNumber)) {
                    resultIndex = index;
                }
            }
        });
    }
    return resultIndex;
}

/**
 * 初始化饼图显示
 * @param {* 饼形图标配置参数 } chartParams 
 */
var initChart = function (chartParams) {
    let baseParams = {
        csElmId: null, percents: null
    };
    if ($.isPlainObject(chartParams)) {
        $.extend(baseParams, chartParams);
    }
    if (!baseParams.csElmId || baseParams.csElmId === '') {
        console.error('公共方法 -> 绘制饼形图表', '参数 画布容器 未定义');
        return;
    }
    if (!baseParams.percents || baseParams.percents === '' || baseParams.percents === []) {
        console.error('公共方法 -> 绘制饼形图表', '参数 饼图成员占比 未定义');
        return;
    }

    let stepClear = 1;
    let clearArc = function (csContext, x, y, radius) {
        var calcWidth = radius - stepClear;
        var calcHeight = Math.sqrt(radius * radius - calcWidth * calcWidth);

        var posX = x - calcWidth;
        var posY = y - calcHeight;

        var widthX = 2 * calcWidth;
        var heightY = 2 * calcHeight;

        if (stepClear <= radius) {
            csContext.clearRect(posX, posY, widthX, heightY);
            stepClear += 1;
            clearArc(x, y, radius);
        }
    };

    let drawCircle = function (csContext, percents, colors) {
        let currentMaxPerc = 0;
        let percentsLength = percents.length;
        let rangeArr = [];
        $.each(percents, function (percIndex, percVal) {
            if (percIndex == 0) {
                rangeArr.push([currentMaxPerc, percVal * 2]);
                currentMaxPerc += percVal * 2;
            } else if (percIndex < percentsLength - 1) {
                rangeArr.push([currentMaxPerc, currentMaxPerc + percVal * 2]);
                currentMaxPerc += percVal * 2;
            } else {
                rangeArr.push([currentMaxPerc, currentMaxPerc + percVal * 2]);
            }
        });
        $.each(rangeArr, function (rangeIndex, rangeVal) {
            if (rangeVal[1] > 2) {
                console.error('公共方法 -> 绘制饼形图表', '项目占比值超过 100%');
                return;
            }
            csContext.beginPath();
            csContext.arc(60, 60, 34, rangeVal[0] * Math.PI, rangeVal[1] * Math.PI);
            if (colors && colors[rangeIndex]) {
                csContext.strokeStyle = colors[rangeIndex];
            } else {
                csContext.strokeStyle = '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).slice(-6);
            }
            csContext.stroke();
        });
        // let interWhIndex = 0;
        // let percIntervalRangeValCurrent = -1;
        // let percIntervalRangeColorCurrent = null;
        // let rangeStart = -1;
        // let rangeEnd = -1;
        // let chartDrawInterval = setInterval(function () {
        //     let interThisRange = null;
        //     if (percIntervalRangeValCurrent < 0) {
        //         interThisRange = rangeArr[interWhIndex];
        //         if (!interThisRange) {
        //             clearInterval(chartDrawInterval);
        //             return;
        //         }
        //         rangeStart = interThisRange[0];
        //         rangeEnd = interThisRange[1];
        //         if (colors && colors[interWhIndex]) {
        //             percIntervalRangeColorCurrent = colors[interWhIndex];
        //         } else {
        //             percIntervalRangeColorCurrent = '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).slice(-6);
        //         }
        //         percIntervalRangeValCurrent = rangeStart;
        //         interWhIndex++;
        //     } else {
        //         if (percIntervalRangeValCurrent > 2) {
        //             console.error('公共方法 -> 绘制饼形图表', '项目占比值超过 100% --> ' + percIntervalRangeValCurrent);
        //             clearInterval(chartDrawInterval);
        //             return;
        //         }
        //         percIntervalRangeValCurrent += 0.01;
        //     }
        //     if (percIntervalRangeValCurrent > rangeEnd) {
        //         percIntervalRangeValCurrent = -1;
        //         percIntervalRangeColorCurrent = null;
        //         rangeStart = -1;
        //         rangeEnd = -1;
        //         return;
        //     }
        //     clearArc(csContext, 60, 60, 34);
        //     csContext.beginPath();
        //     csContext.lineWidth = 30;
        //     csContext.imageSmoothingEnabled = true;
        //     csContext.arc(60, 60, 34, rangeStart * Math.PI, percIntervalRangeValCurrent * Math.PI);
        //     csContext.strokeStyle = percIntervalRangeColorCurrent;
        //     csContext.stroke();
        // }, 5);
    };

    // 进行canvas绘制
    let canvas = document.getElementById(baseParams.csElmId);
    let csContext = canvas.getContext('2d');
    csContext.save();

    csContext.lineWidth = 30;
    drawCircle(csContext, baseParams.percents);

    csContext.restore();
};

/**
 * 初始化页面分页显示
 * @param {* 页面分页配置参数 } transitionParams 
 * @param mode 0：淡入翻页(适合左右和上下操作)
			1、2：简单位移翻页
			3、4：新页位移入场旧页变暗位置不动
			5、6：新旧页同时位移旧页变暗
			7、8：新页位移入场旧页浮动位移
			9、10：新页位移入场旧页变小
			11、12：新页位移入场旧页揭下和9、10差不多
			13、14：旧页位移新页放大入场
			15、16：新页位移入场旧页顶下去
			17、18：新旧页同时面对面翻页入场和出场
			19、20：新旧页像盒子一样转动
			21、22：新旧页像盒子一样展开
			23、24：新旧页像在盒子里一样转动
			25、26：新旧页像盒子一样转动视角由小大变小再由小变大
			27、28：新旧页立体间飞行位移
			29、30：新页缩小和旧变大页翻转交错入场
			31：新页和旧页一起淡入效果同时变小(适合左右和上下操作)
			32：新页和旧页一起淡入效果同时变大(适合左右和上下操作)
			33：新旧页同时面对面翻页入场和出场周时变小与24差不多(适合左右)
			34:旧页固定顶角再掉落新页放大入场(适合左右和上下操作)
			35：旧页缩小移出新页移出放大入场(适合左右)
			36：新页缩小旧页变大交错入场(适合左右和上下操作)
            37：新页缩小和旧变大页旋转交错入场(适合左右和上下操作)
 * @method goToSlide 执行一个幻灯片过渡到提供的幻灯片的索引（从零开始）
 * @method goToNextSlide 执行“下一步”幻灯片过渡
 * @method goToPrevSlide 执行“上一页”的幻灯片过渡
 * @method getCurrentSlide 返回当前活动的幻灯片
 * @method getSlideCount 返回在滑块总幻灯片的数目
 * @method setSlideMode 动态设置新的翻页效果（0-37）
 * @method reloadSlider 重新装入滑块
 */
var initPageTransitions = function (transitionParams) {
    let baseParams = {
        wrapElm: null, mode: 0, preventDefaultSwipeX: true, preventDefaultSwipeY: false, speed: null,
        startSlide: 0, slideSelector: '', infiniteLoop: true, easing: null, slideZIndex: 50, responsive: true, touchIgnoreDomClass: 'touchIgnore',
        touchCanChangePage: function () { return true; },
        wrapperClass: 'fk-page-wrapper', mouseWheel: false, wheelThreshold: 2, swipeThreshold: 50, pagerunstat: false,
        onSliderLoad: function (currentIndex) { }, onSliderResize: function (currentIndex) { }, onSlideBefore: function (newIndex, oldIndex, newElement, oldElement) { },
        onSlideAfter: function (newIndex, oldIndex, newElement, oldElement) { }, onSlideNext: function (newIndex, oldIndex, newElement, oldElement) { },
        onSlidePrev: function (newIndex, oldIndex, newElement, oldElement) { }
    };
    if ($.isPlainObject(transitionParams)) {
        $.extend(baseParams, transitionParams);
    }
    if (baseParams.wrapElm) {
        let fkObj = $(baseParams.wrapElm).FKPageTransitions({
            mode: baseParams.mode,
            preventDefaultSwipeX: baseParams.preventDefaultSwipeX,
            preventDefaultSwipeY: baseParams.preventDefaultSwipeY,
            speed: baseParams.speed,
            startSlide: baseParams.startSlide,
            slideSelector: baseParams.slideSelector,
            infiniteLoop: baseParams.infiniteLoop,
            easing: baseParams.easing,
            slideZIndex: baseParams.slideZIndex,
            responsive: baseParams.responsive,
            touchIgnoreDomClass: baseParams.touchIgnoreDomClass,
            touchCanChangePage: baseParams.touchCanChangePage,
            wrapperClass: baseParams.wrapperClass,
            mouseWheel: baseParams.mouseWheel,
            wheelThreshold: baseParams.wheelThreshold,
            swipeThreshold: baseParams.swipeThreshold,
            pagerunstat: baseParams.pagerunstat,
            onSliderLoad: baseParams.onSliderLoad,
            onSliderResize: baseParams.onSliderResize,
            onSlideBefore: baseParams.onSlideBefore,
            onSlideAfter: baseParams.onSlideAfter,
            onSlideNext: baseParams.onSlideNext,
            onSlidePrev: baseParams.onSlidePrev
        });
        return fkObj;
    } else {
        console.error('初始化页面分页', '绑定根元素不能为空');
    }
};

/**
 * 初始化 WeUI Picker
 * @param {* Picker 的配置参数 } pickerParams 
 */
var initPicker = function (pickerParams) {
    let baseParams = {
        pickerElm: null, title: '请选择', toolbarCloseText: '完成', toolbarTemplate: undefined, value: undefined,
        rotateEffect: false, toolbar: true, inputReadOnly: true, cssClass: undefined, onChange: undefined, onClose: undefined,
        cols: null
    };
    if ($.isPlainObject(pickerParams)) {
        $.extend(baseParams, pickerParams);
    }
    if (baseParams.pickerElm && $.isArray(baseParams.cols)) {
        $(baseParams.pickerElm).picker({
            title: baseParams.title,
            toolbarCloseText: baseParams.toolbarCloseText,
            toolbarTemplate: baseParams.toolbarTemplate,
            value: baseParams.value,
            rotateEffect: baseParams.rotateEffect,
            toolbar: baseParams.toolbar,
            inputReadOnly: baseParams.inputReadOnly,
            cssClass: baseParams.cssClass,
            onChange: baseParams.onChange,
            onClose: baseParams.onClose,
            cols: baseParams.cols
        });
    } else {
        if (!baseParams.pickerElm) {
            console.error('初始化Picker', '绑定根元素不能为空');
        }
        if (!$.isArray(baseParams.cols)) {
            console.error('初始化Picker', '显示文案不是有效的数组');
        }
    }

    this.isShow = function () {
        if ($('div.weui-picker-container').length == 1) {
            return true;
        }
        return false;
    };
};

var canvasObj = function (canvasParams) {
    let baseParams = {
        bearElm: null, width: null, height: null, contextType: '2d', noSupportTip: '', cssClass: null,
        drawFn: function (context) { }
    };
    if ($.isPlainObject(canvasParams)) {
        $.extend(baseParams, canvasParams);
    }
    let canvas = null, context = null;
    if (baseParams.bearElm && $.isNumeric(baseParams.width) && $.isNumeric(baseParams.height)) {
        canvas = document.createElement('canvas');
        context = canvas.getContext(baseParams.contextType);
        canvas.width = baseParams.width;
        canvas.height = baseParams.height;
        if (baseParams.cssClass) {
            canvas.classList.add(baseParams.cssClass);
        }
        $(baseParams.bearElm).append(canvas);
        canvas.innerHTML = baseParams.noSupportTip;

        if (typeof baseParams.drawFn === 'function') {
            baseParams.drawFn(context);
        }
    } else {
        if (!baseParams.bearElm) {
            console.error('初始化canvas容器', 'canvas承载Dom容器不能为空');
        }
        if (!$.isNumeric(baseParams.width)) {
            console.error('初始化canvas容器', 'canvas宽度不是一个有效数值');
        }
        if (!$.isNumeric(baseParams.height)) {
            console.error('初始化canvas容器', 'canvas高度不是一个有效数值');
        }
    }

    // 坐标点对象定义
    this.Point = function (x, y) {
        this.x = x;
        this.y = y;
    };
    // 坐标线对象定义 lineCap: butt、round、square    lineJoin: miter、bevel、round
    this.Line = function (points, lineWidth, strokeColor, lineCap, lineJoin, fillFlag, fillColor, closePathFlag) {
        this.lineWidth = lineWidth;
        this.strokeColor = strokeColor;
        this.lineCap = lineCap;
        this.lineJoin = lineJoin;
        this.fillFlag = fillFlag;
        this.fillColor = fillColor;
        this.closePathFlag = closePathFlag;
        this.linePoints = null;
        let linePointsArr = [];
        if ($.isArray(points)) {
            $.each(points, function (pointIndex, point) {
                linePointsArr.push(point);
            });
            this.linePoints = linePointsArr;
        }
    };
    // 坐标矩形对象定义
    this.Rect = function (startX, startY, width, height) {
        this.startX = startX;
        this.startY = startY;
        this.width = width;
        this.height = height;
    }
    // 坐标圆对象定义
    this.Arc = function (centerX, centerY, radius, startAngle, endAngle, anticlockwise) {
        this.centerX = centerX; // 圆心 X 坐标
        this.centerY = centerY; // 圆心 Y 坐标
        this.radius = radius; // 圆半径
        this.startAngle = startAngle; // 开始角度 0 ~ 2*Math.PI
        this.endAngle = endAngle; // 结束角度 0 ~ 2*Math.PI
        this.anticlockwise = anticlockwise; // 是否逆时针
    };

    /**
     * 绘制线（可多条绘制）
     * @param lines ps: [ new cvs.Line([ new cvs.Point(*, *), ... ]), ... ]
     * @param lineCap 线条末端线帽样式 可选值：butt、round、square
     * @param lineJoin 两条线交汇时所创建边角类型 可选值：miter、bevel、round
     */
    this.drawLine = function (lineParams) {
        let baseParams = {
            lines: null, lineWidth: 1, strokeColor: '#72B6B7', closePathFlag: false, fillFlag: false, fillColor: '#CCE9EA',
            lineCap: 'butt', lineJoin: 'miter'
        };
        if ($.isPlainObject(lineParams)) {
            $.extend(baseParams, lineParams);
        }
        if (context) {
            if ($.isArray(baseParams.lines) && baseParams.lines.length > 0) {
                $.each(baseParams.lines, function (lineIndex, lineData) {
                    context.beginPath();
                    context.lineWidth = baseParams.lineWidth;
                    context.strokeStyle = baseParams.strokeColor;
                    context.lineCap = baseParams.lineCap;
                    context.lineJoin = baseParams.lineJoin;
                    if (baseParams.fillFlag) {
                        context.fillStyle = baseParams.fillColor;
                    }
                    if (lineData.lineWidth) {
                        context.lineWidth = lineData.lineWidth;
                    }
                    if (lineData.strokeColor) {
                        context.strokeStyle = lineData.strokeColor;
                    }
                    if (lineData.lineCap) {
                        context.lineCap = lineData.lineCap;
                    }
                    if (lineData.lineJoin) {
                        context.lineJoin = lineData.lineJoin;
                    }
                    if (lineData.fillFlag && lineData.fillColor) {
                        context.fillStyle = lineData.fillColor;
                    }
                    let linePoints = lineData.linePoints;
                    $.each(linePoints, function (pointIndex, point) {
                        if (pointIndex == 0) {
                            context.moveTo(point.x, point.y);
                        }
                        context.lineTo(point.x, point.y);
                        if (pointIndex == linePoints.length - 1) {
                            if ((baseParams.fillFlag) || (lineData.fillFlag && lineData.fillColor)) {
                                context.fill();
                            }
                            if (baseParams.closePathFlag || lineData.closePathFlag) {
                                context.closePath();
                            }
                            context.stroke();
                        }
                    });
                });
            } else {
                console.error('canvas 绘制线段', '未指定要绘制的线段数据：请使用 Line(Point...) 对象');
            }
        }
    };

    /**
     * 绘制矩形（可绘制多个）
     */
    this.drawRect = function (rectParams) {
        let baseParams = {
            rects: null, lineWidth: 1, strokeColor: '#72B6B7', solidFlag: false, fillFlag: false, fillColor: '#CCE9EA'
        };
        if ($.isPlainObject(rectParams)) {
            $.extend(baseParams, rectParams);
        }
        if (context) {
            if ($.isArray(baseParams.rects) && baseParams.rects.length > 0) {
                $.each(baseParams.rects, function (rectIndex, rect) {
                    context.lineWidth = baseParams.lineWidth;
                    if (baseParams.solidFlag) {
                        context.fillStyle = baseParams.strokeColor;
                        context.fillRect(rect.startX, rect.startY, rect.width, rect.height);
                    } else {
                        if (baseParams.fillFlag) {
                            context.fillStyle = baseParams.fillColor;
                            context.strokeStyle = baseParams.strokeColor;
                            context.fillRect(rect.startX, rect.startY, rect.width, rect.height);
                            context.strokeRect(rect.startX, rect.startY, rect.width, rect.height);
                        } else {
                            context.strokeStyle = baseParams.strokeColor;
                            context.strokeRect(rect.startX, rect.startY, rect.width, rect.height);
                        }
                    }
                });
            } else {
                console.error('canvas 绘制矩形', '未指定要绘制的矩形数据：请使用 Rect() 对象');
            }
        }
    };

    /**
     * 绘制文本
     */
    this.drawText = function () {
        if (context) { }
    };

    /**
     * 绘制圆
     */
    this.drawCircle = function () {
        if (context) {
            context.beginPath();
            context.fillStyle = '#72B6B7';
            //context.fillRect(0, 0, 1, 1);
            context.arc(10, 20, 1, 0, Math.PI * 2, true);
            context.closePath();
            context.fill();
        }
    };
};

/**
 * 初始化文件上传绑定
 * @param {* 文件上传基础参数 } fileUploadParams 
 */
var initFileUpload = function (fileUploadParams) {
    let baseParams = {
        fileElmIds: null, fileUrls: null, fields: null, params: null, accepts: null, exts: null, autos: null, bindActions: null,
        sizes: null,
        chooseFns: null, beforeFns: null, doneFns: null, errorFns: null
    };
    if ($.isPlainObject(fileUploadParams)) {
        $.extend(baseParams, fileUploadParams);
    }
    if ($.isArray(baseParams.fileElmIds) && $.isArray(baseParams.fileUrls)) {
        $.each(baseParams.fileElmIds, function (fileElmIndex, fileElmObj) {
            layui.use('upload', function () {
                let upload = layui.upload;

                let fileUrlThis = baseParams.fileUrls[fileElmIndex];
                if (!fileUrlThis) {
                    console.error('初始化文件上传绑定', '参数：文件上传url地址不正确');
                    return false;
                }

                let fieldThis = 'file';
                if ($.isArray(baseParams.fields) && baseParams.fields[fileElmIndex]) {
                    fieldThis = baseParams.fields[fileElmIndex];
                }

                let paramsData = {};
                if ($.isArray(baseParams.params) && $.isPlainObject(baseParams.params[fileElmIndex])) {
                    $.extend(paramsData, baseParams.params[fileElmIndex]);
                }

                let acceptThis = 'images';
                if ($.isArray(baseParams.accepts) && baseParams.accepts[fileElmIndex]) {
                    acceptThis = baseParams.accepts[fileElmIndex];
                }

                let extsThis = 'jpg|png|gif|bmp|jpeg';
                if ($.isArray(baseParams.exts) && baseParams.exts[fileElmIndex]) {
                    extsThis = baseParams.exts[fileElmIndex];
                }

                let sizeThis = 0;
                if ($.isArray(baseParams.sizes) && $.isNumeric(baseParams.sizes[fileElmIndex])) {
                    sizeThis = baseParams.sizes[fileElmIndex];
                }

                let autoThis = true;
                let bindActionThis = '-';
                if ($.isArray(baseParams.autos) && typeof baseParams.autos[fileElmIndex] === 'boolean'
                    && ((!baseParams.autos[fileElmIndex] && $.isArray(baseParams.bindActions) && baseParams.bindActions[fileElmIndex]) || baseParams.autos[fileElmIndex])) {
                    autoThis = baseParams.autos[fileElmIndex];
                    if (!baseParams.autos[fileElmIndex] && $.isArray(baseParams.bindActions) && baseParams.bindActions[fileElmIndex]) {
                        bindActionThis = baseParams.bindActions[fileElmIndex];
                    }
                }
                if (bindActionThis != '-') {
                    bindActionThis = '#' + bindActionThis;
                }

                upload.render({
                    elem: '#' + fileElmObj,
                    url: fileUrlThis,
                    field: fieldThis,
                    data: paramsData,
                    accept: acceptThis,
                    exts: extsThis,
                    size: sizeThis,
                    auto: autoThis,
                    bindAction: bindActionThis,
                    choose: function (obj) {
                        if ($.isArray(baseParams.chooseFns) && typeof baseParams.chooseFns[fileElmIndex] === 'function') {
                            baseParams.chooseFns[fileElmIndex](obj);
                        }
                    },
                    before: function (obj) {
                        layer.load();
                        if ($.isArray(baseParams.beforeFns) && typeof baseParams.beforeFns[fileElmIndex] === 'function') {
                            baseParams.beforeFns[fileElmIndex](obj);
                        }
                    },
                    done: function (res) {
                        console.log("上传完成", res);
                        layer.closeAll('loading');
                        if ($.isArray(baseParams.doneFns) && typeof baseParams.doneFns[fileElmIndex] === 'function') {
                            baseParams.doneFns[fileElmIndex](res);
                        }
                    },
                    error: function () {
                        layer.closeAll('loading');
                        if ($.isArray(baseParams.errorFns) && typeof baseParams.errorFns[fileElmIndex] === 'function') {
                            baseParams.errorFns[fileElmIndex]();
                        }
                    }
                });
            });
        });
    } else {
        if (!$.isArray(baseParams.fileElmIds)) {
            console.error('初始化文件上传绑定', '参数：选择文件触发节点dom 不是一个有效数组');
        }
        if (!$.isArray(baseParams.fileUrls)) {
            console.error('初始化文件上传绑定', '参数：文件上传url地址 不是一个有效数组');
        }
    }
};

/**
 * 初始化文件上传预览，仅做预览使用，不带有上传功能
 * @param {* 文件上传预览基础参数 } fileUploadShowParams 
 */
var fileUploadShow = function (fileUploadShowParams) {
    let baseParams = {
        elem: null, targetName: 'file', showElem: null, cssClass: '', loadingHtml: '加载中...',
        showFlag: true, fileChangeFn: function (fileData) { }, clearElm: null
    };
    if ($.isPlainObject(fileUploadShowParams)) {
        $.extend(baseParams, fileUploadShowParams);
    }

    let analysisFile = function (file) {
        // 显示加载中动画
        let selectFileLoadingDiv = document.createElement('div');
        selectFileLoadingDiv.style.position = 'absolute';
        selectFileLoadingDiv.classList.add('loadingFile');
        selectFileLoadingDiv.style.width = '100%';
        selectFileLoadingDiv.style.height = '100%';
        selectFileLoadingDiv.style.textAlign = 'center';
        selectFileLoadingDiv.style.top = '0px';
        selectFileLoadingDiv.style.left = '0px';
        selectFileLoadingDiv.style.background = 'rgba(60, 60, 60, .7)';
        selectFileLoadingDiv.style.color = '#efefef';

        selectFileLoadingDiv.innerHTML = baseParams.loadingHtml;

        if (baseParams.showElem) {
            let showElemHeight = $(baseParams.showElem).height();
            selectFileLoadingDiv.style.paddingTop = (showElemHeight * 1 / 3) + 'px';
            $(baseParams.showElem).get(0).style.position = 'relative';
            $(baseParams.showElem).append(selectFileLoadingDiv);
        } else {
            let wrapHeight = $(baseParams.elem).height();
            selectFileLoadingDiv.style.paddingTop = (wrapHeight * 1 / 3) + 'px';
            $(baseParams.elem).get(0).style.position = 'relative';
            $(baseParams.elem).append(selectFileLoadingDiv);
        }

        new Promise(function (resolve, reject) {
            let r = new FileReader();
            r.readAsDataURL(file);
            r.onload = function (e) {
                let fileBase64 = e.target.result;
                let fileDataJson = {
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type,
                    fileBase64: fileBase64
                };
                baseParams.fileChangeFn(fileDataJson);
                if (baseParams.showFlag) {
                    resolve(fileDataJson);
                }
            };
        }).then(function (fileDataJson) {
            let fileBase64 = fileDataJson.fileBase64;
            let wrapWidth = $(baseParams.elem).width();
            let wrapHeight = $(baseParams.elem).height();
            if (file.type.indexOf('image') == 0 && file.type && /\.(?:jpg|png|gif)$/.test(file.name)) {
                if (baseParams.showElem) {
                    let showElemWidth = $(baseParams.showElem).width();
                    let showElemHeight = $(baseParams.showElem).height();
                    $(baseParams.showElem).find('div.loadingFile').fadeOut(function () {
                        $(baseParams.showElem).html('<div style="width: ' + showElemWidth + 'px; height: ' + showElemHeight + 'px; background: url(' + fileBase64 + '); background-repeat: no-repeat; background-size: 100% 100%;"></div>');
                    });
                } else {
                    $(baseParams.elem).find('div.loadingFile').fadeOut(function () {
                        $(baseParams.elem).html('<div style="width: ' + wrapWidth + 'px; height: ' + wrapHeight + 'px; background: url(' + fileBase64 + '); background-repeat: no-repeat; background-size: 100% 100%;"></div>');
                    });
                }
            } else {
                if (baseParams.showElem) {
                    let showElemWidth = $(baseParams.showElem).width();
                    let showElemHeight = $(baseParams.showElem).height();
                    $(baseParams.showElem).find('div.loadingFile').fadeOut(function () {
                        $(baseParams.showElem).html('<div style="width: ' + showElemWidth + 'px; height: ' + showElemHeight + 'px; line-height: ' + showElemHeight + 'px; text-align: center;">' + file.name + '</div>');
                    });
                } else {
                    $(baseParams.elem).find('div.loadingFile').fadeOut(function () {
                        $(baseParams.elem).html('<div style="width: ' + wrapWidth + 'px; height: ' + wrapHeight + 'px; line-height: ' + wrapHeight + 'px; text-align: center;">' + file.name + '</div>');
                    });
                }
            }
        });
    };

    let originalHtml = '';
    let originalShowHtml = '';
    let initFileUploadShowWrap = function (initFlag) {
        if (baseParams.elem) {
            if (initFlag) {
                if (baseParams.showElem) {
                    originalShowHtml = $(baseParams.showElem).html();
                }
                originalHtml = $(baseParams.elem).html();
                let wrapWidth = $(baseParams.elem).width();

                let fileUploadShowWrap = document.createElement('div');
                fileUploadShowWrap.classList.add('fileUploadShowWrap');
                fileUploadShowWrap.style.width = wrapWidth + 'px';
                fileUploadShowWrap.style.position = 'relative';
                fileUploadShowWrap.style.overflow = 'hidden';

                $(baseParams.elem).wrap(fileUploadShowWrap);
            }

            let fileSelectInput = document.createElement('input');
            fileSelectInput.name = baseParams.targetName;
            fileSelectInput.type = 'file';
            fileSelectInput.style.position = 'absolute';
            fileSelectInput.style.top = '0px';
            fileSelectInput.style.left = '0px';
            fileSelectInput.style.width = '100%';
            fileSelectInput.style.height = '100%';
            fileSelectInput.style.initAlpha = 0;
            fileSelectInput.style.filter = 'alpha(opacity: 0)';
            fileSelectInput.style.opacity = 0;
            $(baseParams.elem).get(0).parentNode.insertBefore(fileSelectInput, $(baseParams.elem).get(0).nextSibling);

            if (window.FileReader) {
                $(fileSelectInput).on('change', function () {
                    $.each(this.files, function (fileIndex, fileObj) {
                        if (!fileObj) {
                            return;
                        }
                        analysisFile(fileObj);
                    });
                });
            } else {
                if (baseParams.showFlag) {
                    $(baseParams.showElem).html('<strong>你的浏览器不支持 H5 ~ FileReader</strong>');
                }
            }
        } else {
            console.error('初始化文件上传预览', '绑定对象不能为空');
        }
    };

    initFileUploadShowWrap(true);

    if (baseParams.clearElm) {
        $(baseParams.clearElm).on('click', function () {
            $(baseParams.elem).parent().find('input[type=file]').remove();
            initFileUploadShowWrap(false);
            if (baseParams.showElem) {
                $(baseParams.showElem).html(originalShowHtml);
            } else {
                $(baseParams.elem).html(originalHtml);
            }
        });
    }
};