var areas = document.getElementsByTagName('textarea');

[].slice.call(areas).forEach(function (area) {
	setTimeout(function () {
		area.style.height = (area.scrollHeight || 20) + 'px';
	})
});

