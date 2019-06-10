
;(function () {
	var tag = document.currentScript || '';
	document.addEventListener('DOMContentLoaded', function () {
		if (!tag) throw new Error('script tag of fork.js is undefined!');
		
		var target = tag.dataset.target || '';

		if (!target) throw new Error('data-target of fork.js is undefined!');

		var pic = 'https://image.fanlinfeng.com/github.png';

		var img = new Image;
		img.src = window.devicePixelRatio >= 2 ? pic : pic + '!low';
		img.style.cssText = 'width: 150px; height: 150px; position: fixed; right: 0; top: 0; cursor: pointer; opacity: .8; border: none; z-index: 100000';
		document.body.appendChild(img);
		img.onclick = function () {
			_czc.push(['_trackEvent', 'github-logo', 'jump', target]);
			// _czc.push(['_trackPageview', target, location.href]);
			window.open(target);
		}

		var script = document.createElement('script');
		script.src = 'https://s19.cnzz.com/z_stat.php?id=1274978776';
		document.body.appendChild(script)
	});
})()