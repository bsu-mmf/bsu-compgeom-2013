window.SRect = (function () {
    function SRect(canvas, callback) {
        var me = this;
        this.start = {
            x: 0,
            y: 0
        };
        this.end = {
            x: 0,
            y: 0
        };
        this.params;
        this.callback = callback;
        this.context = canvas.getContext('2d');
        this.csize = {
            w: canvas.width,
            h: canvas.height
        };
        this.context.fillStyle = "rgba(255, 255, 255, 0.5)";
        this.context.strokeWidth = 0.5;
        this.dragging = false;
        this.canvas = canvas;
        this.canvas.onmousedown = function (e) {
            me.fStart(e);
        };
        this.canvas.onmousemove = function (e) {
            me.fRefresh(e);
        };
        this.canvas.onmouseup = function (e) {
            me.fStop(e);
        };

        if (document.defaultView && document.defaultView.getComputedStyle) {
            this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10) || 0;
            this.stylePaddingTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10) || 0;
            this.styleBorderLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10) || 0;
            this.styleBorderTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10) || 0;
        }
        var html = document.body.parentNode;
        this.htmlTop = html.offsetTop;
        this.htmlLeft = html.offsetLeft;
    }

    SRect.prototype.fStart = function (e) {
        var newP = this.getMouse(e);
        this.beginDraw(newP);
        this.start = newP;
        this.end = newP;
        this.dragging = true;
    }

    SRect.prototype.fRefresh = function (e) {
        if (this.dragging) {
            this.contDraw(this.getMouse(e));
        }
    }

    SRect.prototype.fStop = function (e) {
        this.fRefresh(e);
        this.dragging = false;
        this.params = this.getUL();
        if (_.isFunction(this.callback)) {
            this.callback(this.params);
        }
    }

    SRect.prototype.beginDraw = function (newP) {
        if (!_.isUndefined(this.params)) {
            this.context.clearRect(this.params.x, this.params.y, this.params.dx, this.params.dy);
        }
    }
    
    SRect.prototype.clear = function () {
        this.context.clearRect(0, 0, this.csize.w, this.csize.h);
    }

    SRect.prototype.contDraw = function (newP) {
        var ul = this.getUL();
        //this.context.clearRect(ul.x + 10, ul.y + 10, ul.dx + 10, ul.dy );
        this.clear();
        this.end = newP;
        ul = this.getUL();
        this.context.strokeRect(ul.x, ul.y, ul.dx, ul.dy);
    }

    SRect.prototype.getUL = function () {
        var x = Math.min(this.start.x, this.end.x),
            y = Math.min(this.start.y, this.end.y),
            x1 = Math.max(this.start.x, this.end.x),
            y1 = Math.max(this.start.y, this.end.y);
        return {
            x: x,
            y: y,
            dx: x1 - x,
            dy: y1 - y
        };
    }

    SRect.prototype.getMouse = function (e) {
        var rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    return SRect;
}
());