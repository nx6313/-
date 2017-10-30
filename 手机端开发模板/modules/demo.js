layui.define(['form', 'element'], function (exports) {
	var form = layui.form;

	initAppPage({
		elmRender: true
	});
	initLetterSideSlip({
		showLoading: true,
		callBack: (letter) => {
			return new Promise(function (resolve, reject) {
				if (letter == 'B') {
					resolve('返回字母：' + letter);
				} else {
					reject('返回数据失败，字母：' + letter);
				}
			}).then(function (value) {
				console.log(value);
			}, function (value) {
				console.log(value);
			});
		}
	});

	exports('demo', function () { });
});
