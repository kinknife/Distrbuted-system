function mkThrottle(immediate) {
	return function throttle(fn, time) {
		let state = 0, args = null;

		function reset() {
			if (state === 2 || !immediate) {
				fn.apply(null, args);
			}
			state = 0;
			args = null;
		}

		return function () {
			switch (state) {
				case 0: {
					if (immediate) {
						fn.apply(null, arguments);
					} else {
						args = arguments;
					}

					state = 1;
					if (!time) {
						window.requestAnimationFrame(reset);
					} else {
						window.setTimeout(reset, time);
					}
				}
					break;

				case 1: {
					args = arguments;
					state = 2;
				}
					break;

				case 2: {
					args = arguments;
					state = 2;
				}
					break;

				default: {
					throw new Error('invalid state');
				}
			}
		};
	};
}
module.exports = {
	delay: mkThrottle(false),
	immediate: mkThrottle(true),
};
