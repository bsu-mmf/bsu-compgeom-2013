window.lab5 = function () {
	var logicRect = {
		xmin: -10,
		xmax: 10,
		ymin: -10,
		ymax: 10
	},
		canvas = document.getElementById('lab5-canvas'),
		textRotX = document.getElementById('lab5-rx'),
		textRotZ = document.getElementById('lab5-rz'),
		textRotY = document.getElementById('lab5-ry'),
		selectType = document.getElementById('lab5-type'),
		textAlpha = document.getElementById('lab5-alp'),
		buttNew = document.getElementById('lab5-ref'),
		ctx = canvas.getContext('2d'),
		windowRect = {
			xmin: 0,
			xmax: canvas.width,
			ymin: 0,
			ymax: canvas.height
		};

	if (typeof (Number.prototype.toRad) === "undefined") {
		Number.prototype.toRad = function () {
			return this * Math.PI / 180;
		}
	}

	_.each([logicRect, windowRect], function (r) {
		r.dx = r.xmax - r.xmin;
		r.dy = r.ymax - r.ymin;
	});

	function win2log(win) {
		var lr = logicRect,
			wr = windowRect,
			x = lr.xmin + lr.dx * (win.x - wr.xmin) / wr.dx,
			y = lr.ymin + lr.dy * (wr.ymax - win.y) / wr.dy;
		return new Point(x, y);
	}

	function log2win(log) {
		var lr = logicRect,
			wr = windowRect,
			x = Math.floor(wr.xmin + wr.dx * (log.x - lr.xmin) / lr.dx),
			y = Math.floor(wr.ymin + wr.dy * (lr.ymax - log.y) / lr.dy);
		return new Point(x, y);
	}

	function screenToCanvas(e, canv) {
		var rect = canv.getBoundingClientRect();
		return new Point(e.clientX - rect.left, e.clientY - rect.top);
	}

	function applyOrthTransform(logicPoint, projection) {
		var x = logicPoint.x - projection.k * Math.cos(projection.alpha) * logicPoint.z,
			y = logicPoint.y - projection.k * Math.sin(projection.alpha) * logicPoint.z;
		return new Point(x, y);
	}

	function CavalierProjection(alpha) {
		this.k = 1;
		this.alpha = new Number(Math.floor(alpha) || 45).toRad();
	}

	function CabinetProjection(alpha) {
		this.k = 0.5;
		this.alpha = new Number(Math.floor(alpha) || 45).toRad();
	}

	function LogicPoint(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	function LogicEdge(points, color) {
		this.points = points;
		this.color = color || 'blue';
	}
	
	LogicEdge.prototype.getWeight = function(e) {
		var i = 0,
			p = [0, 0, 0]
		_.each(this.points, function(pt) {
			p[0] += pt.x;
			p[1] += pt.y;	
			p[2] += pt.z;	
		});
		return _.map(p, function(e) {
			return e / 4;
		});
	}

	LogicEdge.prototype.draw = function (context, projection) {
		var scrPoint = _.map(this.points, function (p) {
			return applyOrthTransform(p, projection);
		}),
			begin;
		context.beginPath();
		_.each(scrPoint, function (p, i) {
			var screenP = log2win(p);
			if (i === 0) {
				begin = screenP;
				context.moveTo(screenP.x, screenP.y);
			} else {
				context.lineTo(screenP.x, screenP.y);
			}
		});
		//context.lineTo(begin.x, begin.y);
		//context.stroke();
		//context.fillStyle = this.color;
		context.closePath();
        context.stroke();
		//context.fill();
	}
	
	function edgSort(edg1, edg2) {
		var eps = 1e-10,
			w1 = edg1.getWeight(),
			w2 = edg2.getWeight(),
			pos = [ 2, 1, 0];
		for(var i = 0; i < 3; i++) {
			var j = pos[i];
			if(Math.abs(w1[j] - w2[j]) < eps) {
				continue;
			}
			return w1[j] < w2[j] ? -1 : 1;
		}
		return 0;
	}
	
	function LogicForm(points, edges) {
		this.edges = edges;
		this.points = points;
		this.transform = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
		this.transformT = this.transform;
		this.axisFoos = {
			'x': this.getRotXMatrix,
			'y': this.getRotYMatrix,
			'z': this.getRotZMatrix
		};
	}

	LogicForm.prototype.getRotMatrix = function (rotMatrix) {
		return this.multM(this.multM(this.transform, rotMatrix), this.transformT);
	}

	LogicForm.prototype.multM = function (mA, mB) {
		var t = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				for (var k = 0; k < 3; k++) {
					t[i][j] += mA[i][k] * mB[k][j];
				}
			}
		}
		return t;
	}

	LogicForm.prototype.multV = function (vector, matrix) {
		var t = [0, 0, 0];
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				t[i] += vector[j] * matrix[i][j];
			}
		}
		return t;
	}

	LogicForm.prototype.transpose = function (matrix) {
		var t = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				t[j][i] = matrix[i][j];
			}
		}
		return t;
	}

	LogicForm.prototype.rotateImp = function (vector, matrixRot) {
		var v = _.isArray(vector) ? vector : [vector.x, vector.y, vector.z];
		return this.multV(v, this.getRotMatrix(matrixRot));
	}

	LogicForm.prototype.getRotYMatrix = function (angle) {
		var alpha = new Number(Math.floor(angle)).toRad(),
			cosa = Math.cos(alpha),
			sina = Math.sin(alpha),
			matrix = [[cosa, 0, sina], [0, 1, 0], [-sina, 0, cosa]];
		return matrix;
	}

	LogicForm.prototype.getRotXMatrix = function (angle) {
		var alpha = new Number(Math.floor(angle) || 5).toRad(),
			cosa = Math.cos(alpha),
			sina = Math.sin(alpha),
			matrix = [[1, 0, 0], [0, cosa, -sina], [0, sina, cosa]];
		return matrix;
	}

	LogicForm.prototype.getRotZMatrix = function (angle) {
		var alpha = new Number(Math.floor(angle) || 5).toRad(),
			cosa = Math.cos(alpha),
			sina = Math.sin(alpha),
			matrix = [[cosa, -sina, 0], [sina, cosa, 0], [0, 0, 1]];
		return matrix;
	}

	LogicForm.prototype.rotateN = function (angle, axis) {
		if (angle === 0)
			return;
		var matrix = this.axisFoos[axis](angle),
			self = this;
		this.transform = this.multM(this.transform, matrix);
		this.transformT = this.transpose(this.transform);
		_.each(this.points, function (p) {
			var pt = self.rotateImp(p, matrix);
			p.x = pt[0];
			p.y = pt[1]
			p.z = pt[2];
		});
	}

	LogicForm.prototype.rotate = function (angle, axis) {
		var matrix = this.axisFoos[axis](angle),
			self = this;
		_.each(this.points, function (p) {
			var pt = self.rotateImp(p, matrix);
			p.x = pt[0];
			p.y = pt[1]
			p.z = pt[2];
		});
	}

	LogicForm.prototype.draw = function (context, projection) {
		var edges = this.edges.sort(edgSort);
		_.each(edges, function (e) {
			e.draw(context, projection);
		});
	}

	function createCube() {
		var p = [
        new LogicPoint(-3, -3, -3),
        new LogicPoint(-3, -3, 3),
        new LogicPoint(-3, 3, -3),
        new LogicPoint(-3, 3, 3),
        new LogicPoint(3, -3, -3),
        new LogicPoint(3, -3, 3),
        new LogicPoint(3, 3, -3),
        new LogicPoint(3, 3, 3)
		],
			edges = [
        new LogicEdge([p[0], p[1], p[3], p[2]]),
        new LogicEdge([p[4], p[6], p[7], p[5]]),
        new LogicEdge([p[2], p[3], p[7], p[6]]),
        new LogicEdge([p[0], p[1], p[5], p[4]]),
        new LogicEdge([p[0], p[2], p[6], p[4]]),
        new LogicEdge([p[3], p[7], p[5], p[1]])
			];
		return {
			p: p,
			e: edges
		};
	}

	var timerid;

	buttNew.onclick = function () {
		var rx = +textRotX.value,
			rz = +textRotZ.value,
			ry = +textRotY.value,
			type = selectType.selectedIndex,
			angle = +textAlpha.value,
			proj,
			cube = createCube(),
			rect = new LogicForm(cube.p, cube.e);
		rect.rotateN(rx, 'x');
		rect.rotateN(ry, 'y');
		rect.rotateN(rz, 'z');
		if (type === 0 || type === 1) {
			proj = type ? new CabinetProjection(angle) : new CavalierProjection(angle);
			if (!_.isUndefined(timerid)) {
				clearInterval(timerid);
			}
			timerid = setInterval(function () {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				rect.rotate(5, 'y');
				rect.draw(ctx, proj);
			}, 200);
		}
	}

	triggerRedrawEvent(buttNew);
}