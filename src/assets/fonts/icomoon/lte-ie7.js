/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-home' : '&#xe000;',
			'icon-office' : '&#xe002;',
			'icon-newspaper' : '&#xe003;',
			'icon-pencil' : '&#xe004;',
			'icon-pencil-2' : '&#xe005;',
			'icon-books' : '&#xe006;',
			'icon-book' : '&#xe007;',
			'icon-film' : '&#xe00a;',
			'icon-file' : '&#xe00b;',
			'icon-profile' : '&#xe00c;',
			'icon-tablet' : '&#xe00d;',
			'icon-mobile' : '&#xe00e;',
			'icon-mobile-2' : '&#xe00f;',
			'icon-screen' : '&#xe010;',
			'icon-laptop' : '&#xe011;',
			'icon-images' : '&#xe001;',
			'icon-headphones' : '&#xe008;',
			'icon-file-2' : '&#xe009;',
			'icon-link' : '&#xe013;',
			'icon-location' : '&#xe014;',
			'icon-html5' : '&#xe012;',
			'icon-linkedin' : '&#xe015;',
			'icon-github' : '&#xe016;',
			'icon-github-2' : '&#xe017;',
			'icon-wordpress' : '&#xe018;',
			'icon-tumblr' : '&#xe019;',
			'icon-skype' : '&#xe01b;',
			'icon-facebook' : '&#xe01c;',
			'icon-twitter' : '&#xe01d;',
			'icon-facebook-2' : '&#xe01a;',
			'icon-google-plus' : '&#xe01e;',
			'icon-google-plus-2' : '&#xe01f;',
			'icon-github-3' : '&#xe020;',
			'icon-wordpress-2' : '&#xe021;',
			'icon-tumblr-2' : '&#xe022;',
			'icon-apple' : '&#xe023;',
			'icon-android' : '&#xe024;',
			'icon-windows8' : '&#xe025;',
			'icon-quill' : '&#xe026;',
			'icon-qrcode' : '&#xe027;',
			'icon-redo' : '&#xe028;',
			'icon-undo' : '&#xe029;',
			'icon-library' : '&#xe02a;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, html, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};