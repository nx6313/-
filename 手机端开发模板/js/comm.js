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
