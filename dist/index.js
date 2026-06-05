//#region src/index.ts
var e = {
	a: 1,
	b: 2,
	c: 4,
	d: 8,
	e: 16,
	f: 32,
	g: 64,
	dp: 128
}, t = {
	dot: "dp",
	dp: "dp"
}, n = Object.fromEntries(Object.entries({
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
}).map(([e, t]) => [e, c(t)])), r = {
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
function i(e, t) {
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
function a(t, n, a, o = {}) {
	var s;
	let c = {
		...r,
		...o
	}, l = new Set((s = o.dots) == null ? [] : s), u = a.length;
	if (u === 0) return;
	let d = Math.tan(-c.skewDeg * Math.PI / 180), f = u * 6 + (u - 1) * c.digitGap, p = Math.min(n.h / (9 + 2 * c.padY), n.w / (f + 2 * c.padX)), m = p * c.thickness, h = 6 * p + c.digitGap * p, g = Infinity, _ = Infinity, v = -Infinity, y = -Infinity, b = [];
	for (let e = 0; e < u; e++) {
		let t = e * h, n = i(p, m).map((e) => ({
			s: e.s,
			pts: e.pts.map(([e, n]) => [e + t, n])
		})), r = [5.25 * p + m / 2 + t, 9 * p - m / 2], a = m / 2;
		b.push({
			shapes: n,
			dpC: r,
			dpR: a
		});
		for (let e of n) for (let [t, n] of e.pts) {
			let e = t + d * n;
			e < g && (g = e), e > v && (v = e), n < _ && (_ = n), n > y && (y = n);
		}
		for (let e of [r[0] - a, r[0] + a]) for (let t of [r[1] - a, r[1] + a]) {
			let n = e + d * t;
			n < g && (g = n), n > v && (v = n), t < _ && (_ = t), t > y && (y = t);
		}
	}
	let x = n.x + n.w / 2 - (g + v) / 2, S = n.y + n.h / 2 - (_ + y) / 2, C = (e, t) => [e + d * t + x, t + S], w = (e, n) => {
		t.beginPath(), t.moveTo(e[0][0], e[0][1]);
		for (let n = 1; n < e.length; n++) t.lineTo(e[n][0], e[n][1]);
		t.closePath(), E(n), t.fill(), t.shadowBlur = 0;
	}, T = (e, n, r, i) => {
		t.beginPath(), t.arc(e, n, r, 0, Math.PI * 2), E(i), t.fill(), t.shadowBlur = 0;
	}, E = (e) => {
		e ? (t.fillStyle = c.color, t.shadowColor = c.glowColor, t.shadowBlur = c.glow * p) : (t.fillStyle = c.offColor, t.shadowBlur = 0);
	};
	for (let t = 0; t < u; t++) {
		var D;
		let n = (D = a[t]) == null ? 0 : D, r = b[t];
		for (let t of r.shapes) w(t.pts.map(([e, t]) => C(e, t)), (n & e[t.s]) !== 0);
		let [i, o] = C(r.dpC[0], r.dpC[1]);
		T(i, o, r.dpR, l.has(t) || (n & e.dp) !== 0);
	}
}
function o(e, t) {
	return {
		...e,
		dots: t
	};
}
function s(e, t, n, r) {
	var i;
	let a = e == null ? "" : String(e);
	if (!t || t <= 0) return a;
	a.length > t && (a = n === "right" ? a.slice(a.length - t) : a.slice(0, t));
	let o = (i = r[0]) == null ? " " : i;
	return n === "right" ? a.padStart(t, o) : a.padEnd(t, o);
}
function c(n) {
	if (n == null) return 0;
	if (typeof n == "number") return n & 255;
	if (typeof n == "string") {
		let t = 0;
		for (let i = 0; i < n.length; i++) {
			var r;
			if (n.startsWith("dot", i)) {
				t |= e.dp, i += 2;
				continue;
			}
			if (n.startsWith("dp", i)) {
				t |= e.dp, i += 1;
				continue;
			}
			let a = n[i] === "." ? "dp" : n[i];
			t |= (r = e[a]) == null ? 0 : r;
		}
		return t;
	}
	let i = 0;
	for (let r of n) {
		var a, o;
		let n = (a = t[r]) == null ? r : a;
		i |= (o = e[n]) == null ? 0 : o;
	}
	return i;
}
function l(e, t, r, i, a) {
	if (e) {
		let t = Array.from(e, c);
		if (!r || r <= 0) return t;
		t.length > r && (t = i === "right" ? t.slice(t.length - r) : t.slice(0, r));
		let n = c(a), o = Array.from({ length: r - t.length }, () => n);
		return i === "right" ? [...o, ...t] : [...t, ...o];
	}
	return Array.from(s(t, r, i, a), (e) => {
		var t;
		return (t = n[e]) == null ? 0 : t;
	});
}
function u(e, t, n) {
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
var d = class {
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
		let r = this.canvas.clientWidth, i = this.canvas.clientHeight;
		if (!r || !i) return;
		let s = typeof window < "u" && window.devicePixelRatio || 1;
		this.ctx.setTransform(s, 0, 0, s, 0, 0), this.ctx.clearRect(0, 0, r, i);
		let c = l(this.options.segments, this.options.value, this.options.digits, (e = this.options.align) == null ? "right" : e, (t = this.options.padChar) == null ? " " : t);
		a(this.ctx, u(this.options.area, r, i), c, o(this.options, (n = this.options.dots) == null ? [] : n));
	}
};
function f(e, t = {}) {
	return new d(e, t);
}
//#endregion
export { e as SEGMENT_BITS, d as SegDisplay, f as createSegDisplay };
