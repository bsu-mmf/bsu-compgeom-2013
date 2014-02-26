window.Point = (function () {
    function Point(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius || 1;
        this.deactivate = 'green';
        this.activate = '#FF9900';
        this.arr = [this.x, this.y];
    }

    Point.prototype.str = function () {
        return '(' + this.x + ',' + this.y + ')';
    }

    Point.prototype.distance = function (p) {
        return Math.sqrt(Math.pow(this.x - p.x, 2), Math.pow(this.y - p.y, 2));
    }

    Point.prototype.isAdjacent = function (p, eps) {
        if (_.isUndefined(eps)) {
            eps = 1e-5;
        }
        return Math.abs(this.distance(p) - Math.sqrt(2)) < eps;
    }

    Point.prototype.draw = function (context, color) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.fillStyle = color || this.deactivate;
        context.fill();
    }
    
    Point.prototype.erase = function (context, color) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius + 1, 0, 2 * Math.PI);
        context.fillStyle = color || 'white';
        context.fill();
    }

    Point.prototype.makeActive = function (context, color) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        context.fillStyle = color || this.activate;
        context.fill();
    }
    
    return Point;
}());