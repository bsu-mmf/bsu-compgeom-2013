window.lab2 = function () {
    var canvas = document.getElementById('lab2-canvas'),
        hullList = document.getElementById('lab2-hull'),
        txtPoints = document.getElementById('lab2-p'),
        buttonNew = document.getElementById('lab2-new');

    function generatePointsMap(pts, width, height) {
        var points = [],
            save = {};
        _.times(pts < 0 ? 0 : pts, function () {
            var cw, ch;
            do {
                cw = nextRnd(width), ch = nextRnd(height);
            } while (_.has(save, cw + '_' + ch));
            save[cw + '_' + ch] = 1;
            points.push(new Point(cw, ch));
        });
        return points;
    }

    function createSortFunction(startX) {
        function isStartX(a) {
            return a.x === startX.x && a.y === startX.y;
        }

        function isOnTheSameLine(a) {
            return a.x === startX.x;
        }

        return function (a, b) {
            if (a.x === b.x && a.y === b.y) {
                return 0;
            }
            var c1 = isStartX(a),
                c2 = isStartX(b),
                c3 = isOnTheSameLine(a),
                c4 = isOnTheSameLine(b),
                r1, r2;
            switch (true) {
            case c1:
                return -1;
            case c2:
                return 1;
            case c3 && c4:
                return a.y < b.y ? 1 : -1;
            case c3:
                return 1;
            case c4:
                return -1;
            default:
                r1 = (a.y - startX.y) / (a.x - startX.x);
                r2 = (b.y - startX.y) / (b.x - startX.x);
                if (Math.abs(r1 - r2) < 1e-7) { // equals
                    return a.x < b.x ? -1 : 1;
                } else {
                    return r1 < r2 ? -1 : 1;
                }
            }
        }
    }

    function sortPointsByAngle(points) {
        var minPoint;
        _.each(points, function (pt) {
            if (_.isUndefined(minPoint)) {
                minPoint = pt;
            } else if (pt.x < minPoint.x) {
                minPoint = pt;
            } else if (pt.x === minPoint.x && pt.y < minPoint.y) {
                minPoint = pt;
            }
        });
        return points.sort(createSortFunction(minPoint));
    }

    function isRightTurn(pt, stack) {
        var len = stack.length;
        if (len < 2) {
            alert('Graham algorithm error');
            return false;
        } else {
            var last = stack[len - 1],
                plast = stack[len - 2],
                p1 = {
                    x: last.x - plast.x,
                    y: last.y - plast.y
                },
                p2 = {
                    x: pt.x - plast.x,
                    y: pt.y - plast.y
                };
            return p1.x * p2.y - p1.y * p2.x < 0;
        }
    }

    function grahamScan(sortedPoints) {
        var stack = [];
        _.each(sortedPoints, function (pt, i) {
            if (i < 2) {
                stack.push(pt);
            } else {
                while (stack.length > 1 && isRightTurn(pt, stack)) {
                    stack.pop();
                }
                stack.push(pt);
            }
        });
        return stack;
    }

    function drawHull(context, points) {
        context.lineWidth = 1;
        context.beginPath();
        var start;
        _.each(points, function (pt, i) {
            if (i === 0) {
                start = pt;
                context.moveTo(pt.x, pt.y);
            } else {
                context.lineTo(pt.x, pt.y);
            }
        });
        context.lineTo(start.x, start.y);
        context.stroke();
    }

    buttonNew.onclick = function () {
        hullList.innerHTML = '';
        var context = canvas.getContext('2d'),
            cwidth = canvas.width,
            cheight = canvas.height,
            points = generatePointsMap(+txtPoints.value, cwidth, cheight),
            html = '',
            prev = -1;
        context.clearRect(0, 0, cwidth, cheight);
        _.each(points, function (pt) {
            pt.draw(context);
        });
        points = sortPointsByAngle(points);
        var hull = grahamScan(points);
        drawHull(context, hull);
        _.each(hull, function (p) {
            html += '<option>' + p.str() + '</option>';
        });
        hullList.innerHTML = html;
        hullList.onchange = function () {
            var index = hullList.selectedIndex;
            if (index != prev && prev !== -1 && !_.isUndefined(hull[prev])) {
                hull[prev].draw(context);
            }
            if (index > -1 && !_.isUndefined(hull[index])) {
                hull[index].makeActive(context);
                prev = index;
            }
        }
    }
    triggerRedrawEvent(buttonNew);
}