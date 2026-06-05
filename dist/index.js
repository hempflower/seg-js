//#region src/index.ts
var e = {
	0: "abcdef",
	1: "bc",
	2: "abged",
	3: "abgcd",
	4: "fgbc",
	5: "afgcd",
	6: "afgecd",
	7: "abc",
	8: "abcdefg",
	9: "abcdfg",
	"-": "g",
	" ": ""
}, t = {
	color: "#ff2d18",
	offColor: "rgba(120,20,12,.18)",
	glowColor: "rgba(255,45,24,.9)",
	glow: .9,
	skewDeg: 5,
	thickness: .78,
	digitGap: .35,
	padX: 2,
	padY: .65
};
function n(e, t) {
	let n = 5 * e - 2 * t, r = t, i = t, a = (9 * e - 3 * t) / 2, o = (e, t) => [
		[e + .1 * n, t],
		[e + .9 * n, t],
		[e + n, t + .5 * r],
		[e + .9 * n, t + r],
		[e + .1 * n, t + r],
		[e, t + .5 * r]
	], s = (e, t) => [
		[e, t + .1 * a],
		[e + .5 * i, t],
		[e + i, t + .1 * a],
		[e + i, t + .9 * a],
		[e + .5 * i, t + a],
		[e, t + .9 * a]
	];
	return [
		{
			s: "a",
			pts: o(t, 0)
		},
		{
			s: "g",
			pts: o(t, 4.5 * e - t / 2)
		},
		{
			s: "d",
			pts: o(t, 9 * e - t)
		},
		{
			s: "f",
			pts: s(0, t)
		},
		{
			s: "b",
			pts: s(5 * e - t, t)
		},
		{
			s: "e",
			pts: s(0, 4.5 * e + t / 2)
		},
		{
			s: "c",
			pts: s(5 * e - t, 4.5 * e + t / 2)
		}
	];
}
function r(r, i, a, o = {}) {
	var s;
	let c = {
		...t,
		...o
	}, l = new Set((s = o.dots) == null ? [] : s), u = a.length;
	if (u === 0) return;
	let d = Math.tan(-c.skewDeg * Math.PI / 180), f = u * 6 + (u - 1) * c.digitGap, p = Math.min(i.h / (9 + 2 * c.padY), i.w / (f + 2 * c.padX)), m = p * c.thickness, h = 6 * p + c.digitGap * p, g = Infinity, _ = Infinity, v = -Infinity, y = -Infinity, b = [];
	for (let e = 0; e < u; e++) {
		let t = e * h, r = n(p, m).map((e) => ({
			s: e.s,
			pts: e.pts.map(([e, n]) => [e + t, n])
		})), i = [5.25 * p + m / 2 + t, 9 * p - m / 2], a = m / 2;
		b.push({
			shapes: r,
			dpC: i,
			dpR: a
		});
		for (let e of r) for (let [t, n] of e.pts) {
			let e = t + d * n;
			e < g && (g = e), e > v && (v = e), n < _ && (_ = n), n > y && (y = n);
		}
		for (let e of [i[0] - a, i[0] + a]) for (let t of [i[1] - a, i[1] + a]) {
			let n = e + d * t;
			n < g && (g = n), n > v && (v = n), t < _ && (_ = t), t > y && (y = t);
		}
	}
	let x = i.x + i.w / 2 - (g + v) / 2, S = i.y + i.h / 2 - (_ + y) / 2, C = (e, t) => [e + d * t + x, t + S], w = (e, t) => {
		r.beginPath(), r.moveTo(e[0][0], e[0][1]);
		for (let t = 1; t < e.length; t++) r.lineTo(e[t][0], e[t][1]);
		r.closePath(), E(t), r.fill(), r.shadowBlur = 0;
	}, T = (e, t, n, i) => {
		r.beginPath(), r.arc(e, t, n, 0, Math.PI * 2), E(i), r.fill(), r.shadowBlur = 0;
	}, E = (e) => {
		e ? (r.fillStyle = c.color, r.shadowColor = c.glowColor, r.shadowBlur = c.glow * p) : (r.fillStyle = c.offColor, r.shadowBlur = 0);
	};
	for (let t = 0; t < u; t++) {
		var D;
		let n = (D = e[a[t]]) == null ? "" : D, r = b[t];
		for (let e of r.shapes) w(e.pts.map(([e, t]) => C(e, t)), n.includes(e.s));
		let [i, o] = C(r.dpC[0], r.dpC[1]);
		T(i, o, r.dpR, l.has(t));
	}
}
function i(e, t) {
	return {
		...e,
		dots: t
	};
}
function a(e, t, n, r) {
	var i;
	let a = e == null ? "" : String(e);
	if (!t || t <= 0) return a;
	a.length > t && (a = n === "right" ? a.slice(a.length - t) : a.slice(0, t));
	let o = (i = r[0]) == null ? " " : i;
	return n === "right" ? a.padStart(t, o) : a.padEnd(t, o);
}
function o(e, t, n) {
	var r, i, a, o;
	let s = (r = e == null ? void 0 : e.x) == null ? 0 : r, c = (i = e == null ? void 0 : e.y) == null ? 0 : i, l = (a = e == null ? void 0 : e.w) == null ? 1 : a, u = (o = e == null ? void 0 : e.h) == null ? 1 : o;
	return (e == null ? void 0 : e.unit) === "px" ? {
		x: s,
		y: c,
		w: l,
		h: u
	} : {
		x: s * t,
		y: c * n,
		w: l * t,
		h: u * n
	};
}
var s = class {
	constructor(e, t = {}) {
		this.pendingRender = 0, this.canvas = e;
		let n = e.getContext("2d");
		if (!n) throw Error("seg-js: 2D context unavailable");
		this.ctx = n, this.options = t, this.fit(), typeof ResizeObserver < "u" && (this.ro = new ResizeObserver(() => {
			this.fit(), this.requestRender();
		}), this.ro.observe(e)), this.requestRender();
	}
	update(e) {
		this.options = {
			...this.options,
			...e
		}, this.requestRender();
	}
	destroy() {
		var e;
		this.pendingRender && cancelAnimationFrame(this.pendingRender), this.pendingRender = 0, (e = this.ro) == null || e.disconnect();
	}
	fit() {
		let e = typeof window < "u" && window.devicePixelRatio || 1, t = this.canvas.clientWidth, n = this.canvas.clientHeight;
		if (t && n) {
			let r = Math.round(t * e), i = Math.round(n * e);
			this.canvas.width !== r && (this.canvas.width = r), this.canvas.height !== i && (this.canvas.height = i);
		}
	}
	requestRender() {
		this.pendingRender || (this.pendingRender = requestAnimationFrame(() => {
			this.pendingRender = 0, this.render();
		}));
	}
	render() {
		var e, t, n;
		let s = this.canvas.clientWidth, c = this.canvas.clientHeight;
		if (!s || !c) return;
		let l = typeof window < "u" && window.devicePixelRatio || 1;
		this.ctx.setTransform(l, 0, 0, l, 0, 0), this.ctx.clearRect(0, 0, s, c);
		let u = a(this.options.value, this.options.digits, (e = this.options.align) == null ? "right" : e, (t = this.options.padChar) == null ? " " : t);
		r(this.ctx, o(this.options.area, s, c), u, i(this.options, (n = this.options.dots) == null ? [] : n));
	}
};
function c(e, t = {}) {
	return new s(e, t);
}
//#endregion
export { s as SegDisplay, c as createSegDisplay };
