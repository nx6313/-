layui.define(['form'], function (exports) {
	var form = layui.form;

	initAppPage({
		leftIcon: 'icon-jingyu',
		refFlag: true,
		leftMenus: ['icon-jingyu:撒大声地', 'icon-category:第三方', '斯蒂芬是否都fsdffsd是'],
		leftMenuFns: [
			function () { console.log('点击了第一项'); return false; },
			function () { console.log('点击了第二项'); },
			function () { console.log('点击了第三项'); }
		],
		refFn: () => {
			return new Promise(function (resolve, reject) {
				if (1 < 0) {
					resolve('返回数据成功');
				} else {
					reject('返回数据失败');
				}
			}).then(function (value) {
				console.log(value);
				return { code: 1, msg: '成功' };
			}, function (value) {
				console.log(value);
				return { code: 0, msg: '失败' };
			});
		},
		refAfterFn: (ref) => { console.log('刷新完成，在执行下拉区域回去之后', ref); }
	});
	// 初始化图标
	initChart({
		csElmId: 'chartCanvas',
		percents: [0.13, 0.16, 0.12, 0.08, 0.18, 0.09, 0.14, 0.1]
	});

	exports('chart', function () { });
});
