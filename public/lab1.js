window.lab1 = function () {
    'use strict';
    var btnnew = document.getElementById('lab1-new'),
        btngrid = document.getElementById('lab1-grid'),
        textpts = document.getElementById('lab1-p'),
        textk = document.getElementById('lab1-k'),
        canvas = document.getElementById('lab1-canvas'),
        selection = document.getElementById('lab1-selection'),
        selectPoints = document.getElementsByClassName('lab1-point-selector')[0],
        treeRoot;

    function Quarter(qTreeNode) {
        this.node = qTreeNode;
        this.points = [];
    }

    Quarter.prototype.append = function (point) {
        return this.points.push(point);
    }

    Quarter.prototype.commit = function (k) {
        return this.node.build(this.points, k);
    }

    function QTreeNode(pLLeft, pURight) {
        this.pos = {
            lw: pLLeft,
            up: pURight
        };
        this.nodes = {};
        this.points;
    }

    QTreeNode.prototype.intersect = function (lowerLeft, upperRight) {
        var myleft = this.pos.lw,
            myright = this.pos.up,
            nLeftX = Math.max(myleft.x, lowerLeft.x),
            nRightX = Math.min(myright.x, upperRight.x),
            nUpperY = Math.min(myleft.y, lowerLeft.y),
            nLowerY = Math.max(myright.y, upperRight.y),
            points = [],
            me = this;
        if (nLeftX > nRightX || nLowerY > nUpperY) {
            return [];
        } else {
            if (this.isLeaf()) {
                var validPoints = _.filter(this.points, function (pt) {
                    return nLeftX <= pt.x && pt.x <= nRightX && nLowerY <= pt.y && pt.y <= nUpperY;
                });
                return validPoints;
            } else {
                var lw = new Point(nLeftX, nUpperY),
                    up = new Point(nRightX, nLowerY);
                _.each(this.nodes, function(n) {
                    points = points.concat(n.node.intersect(lw, up));
                });
                return points;
            }
        }
    }

    QTreeNode.prototype.draw = function (grid, context) {
        if (this.isLeaf()) {
            if (grid) {
                var l = this.pos.lw,
                    r = this.pos.up;
                context.lineWidth = 0.5;
                context.strokeStyle = 'gray';
                context.strokeRect(l.x, r.y, Math.abs(r.x - l.x) + 0.5, Math.abs(l.y - r.y));
            }
            _.each(this.points, function (p) {
                p.draw(context);
            });
        } else {
            _.each(this.nodes, function (quarter) {
                quarter.node.draw(grid, context);
            });
        }
    }

    QTreeNode.prototype.build = function (points, k) {
        if (_.isUndefined(k)) {
            k = 3;
        }
        if (points.length > k && !this.pos.lw.isAdjacent(this.pos.up)) {
            this.divide();
            var me = this;
            _.each(points, function (p) {
                var cCuarter = me.belongs(p);
                if (cCuarter != null) {
                    cCuarter.append(p);
                }
            });
            _.each(this.nodes, function (n) {
                n.commit(k);
            })
        } else {
            this.points = points;
        }
        return this;
    }

    QTreeNode.prototype.divide = function () {
        var size = this.getSize(),
            right = this.pos.up,
            left = this.pos.lw,
            dx = Math.ceil(size.dx / 2),
            dy = Math.ceil(size.dy / 2),
            me = this;
        _.each([0, 1], function (j) {
            _.each([0, 1], function (i) {
                var xs = left.x + dx * i,
                    xn = Math.min(xs + dx, right.x),
                    ys = right.y + dy * j,
                    yn = Math.min(ys + dy, left.y);
                me.nodes['q' + (i + j * 2 + 1)] = new Quarter(new QTreeNode(new Point(xs, yn), new Point(xn, ys)));
            });
        });
    }

    QTreeNode.prototype.getSize = function () {
        return {
            dx: this.pos.up.x - this.pos.lw.x,
            dy: this.pos.lw.y - this.pos.up.y
        };
    }

    QTreeNode.prototype.isLeaf = function () {
        return !_.isUndefined(this.points);
    }

    QTreeNode.prototype.belongs = function (point) {
        var size = this.getSize(),
            right = this.pos.up,
            left = this.pos.lw,
            dx = Math.ceil(size.dx / 2),
            dy = Math.ceil(size.dy / 2),
            cx1 = left.x <= point.x && point.x < left.x + dx,
            cx2 = left.x + dx <= point.x && point.x < right.x,
            cy1 = right.y <= point.y && point.y < right.y + dy,
            cy2 = right.y + dy <= point.y && point.y < left.y,
            quarter;
        switch (true) {
        case cx1 && cy1:
            quarter = this.nodes.q1;
            break;
        case cx2 && cy1:
            quarter = this.nodes.q2;
            break;
        case cx1 && cy2:
            quarter = this.nodes.q3;
            break;
        case cx2 && cy2:
            quarter = this.nodes.q4;
            break;
        default:
            alert('ERROR: Unknown point ' + point.str() + ' in rectangle ' + left.str() + '-' + right.str());
            quarter = null;
            break;
        }
        return quarter;
    }

    function generatePointsMap(pts, k, width, height) {
        var points = [];
        selectPoints.innerHTML = '';
        _.times(pts < 0 ? 0 : pts, function () {
            points.push(new Point(nextRnd(width), nextRnd(height)));
        });
        var tree = new QTreeNode(new Point(0, height), new Point(width, 0));
        tree.build(points, k);
        return tree;
    }
    
    function redraw(root) {
        var context = canvas.getContext('2d'),
            cwidth = canvas.width,
            cheight = canvas.height;
        if (root) {
            context.clearRect(0, 0, cwidth, cheight);
            root.draw(btngrid.checked, context);
        }
    }
    
    var srect = new SRect(selection, function(rect) {
        var points = treeRoot.intersect(new Point(rect.x, rect.y + rect.dy), new Point(rect.x + rect.dx, rect.y)),
            html = '',
            prev = -1,
            context = canvas.getContext('2d');
        _.each(points, function(p, i) {
            html += '<option value = "' + i + '">' + p.str() + '</option>'; 
        });
        selectPoints.innerHTML = html;
        selectPoints.onchange = function() {
            var index = selectPoints.selectedIndex;
            if(index != prev && prev !== -1 && !_.isUndefined(points[prev])) {
                points[prev].draw(context);
            }
            if(index > -1 && !_.isUndefined(points[index])) {
                points[index].makeActive(context);
                prev = index;
            }
        }
    });
    
    btnnew.onclick = function () {
        var cwidth = canvas.width,
            cheight = canvas.height,
            pts = +textpts.value,
            k = +textk.value;
        srect.clear();
        treeRoot = generatePointsMap(pts, k, cwidth, cheight);
        redraw(treeRoot);
    }
    
    btngrid.onclick = function () {
        redraw(treeRoot);
    }
    
    triggerRedrawEvent(btnnew);
}