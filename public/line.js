window.Line = (function () {
    function Line(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
        this.visible = [[p1, p2]];
        this.invisible = [];
        this.dx = this.p2.x - this.p1.x;
        this.dy = this.p2.y - this.p1.y;
    }

    Line.prototype.rangeCheck = function (m, c, tmin, tmax) {
        var res;
        if (m < 0) {
            res = c / m;
            if (tmax < res) {
                return {
                    vis: false
                };
            }
            if (tmin < res) {
                return {
                    vis: true,
                    dom: [res, tmax]
                };
            }
        } else if (m > 0) {
            res = c / m;
            if (res < tmin) {
                return {
                    vis: false
                };
            }
            if (res < tmax) {
                return {
                    vis: true,
                    dom: [tmin, res]
                };
            }
        } else if (c < 0) {
            return {
                vis: false
            };
        }
        return {
            vis: true,
            dom: [tmin, tmax]
        };
    }

    Line.prototype.clipLine = function (wBottom, wTop) {
        var tmin = 0,
            tmax = 1,
            p1 = this.p1,
            p2 = this.p2,
            skip = false,
            opts = [{
                    m: -this.dx,
                    c: p1.x - wBottom.x
                }, {
                    m: this.dx,
                    c: wTop.x - p1.x
                }, {
                    m: -this.dy,
                    c: p1.y - wTop.y
                }, {
                    m: this.dy,
                    c: wBottom.y - p1.y
                }],
            me = this;
        this.visible = [];
        this.invisible = [];
        _.each(opts, function (op) {
            if (!skip) {
                var res = me.rangeCheck(op.m, op.c, tmin, tmax);
                if (!res.vis) {
                    skip = true;
                } else {
                    tmin = res.dom[0];
                    tmax = res.dom[1];
                }
            }
        });
        if (skip) {
            this.invisible.push([p1, p2]);
        } else {
            if (tmin !== 0) {
                this.invisible.push(this.getDom(0, tmin));
            }
            this.visible.push(this.getDom(tmin, tmax));
            if (tmax !== 1) {
                this.invisible.push(this.getDom(tmax, 1));
            }
        }
    }

    Line.prototype.getDom = function (tmin, tmax) {
        return [this.getPt(tmin), this.getPt(tmax)];
    }

    Line.prototype.getPt = function (t) {
        var x = Math.floor(this.p1.x + t * this.dx),
            y = Math.floor(this.p1.y + t * this.dy);
        return new Point(x, y);
    }

    Line.prototype.draw = function (context) {
        _.each([{
                col: 'green',
                arr: this.visible
            }, {
                col: 'yellow',
                arr: this.invisible
            }], function (style) {
            context.beginPath();
            context.strokeStyle = style.col;
            _.each(style.arr, function (pack) {
                var p0 = pack[0],
                    p1 = pack[1];
                context.moveTo(p0.x, p0.y);
                context.lineTo(p1.x, p1.y);
            });
            context.stroke();
        });
    }

    return Line;
}());