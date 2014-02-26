window.lab3 = function () {
    var mainCanvas = document.getElementById('lab3-canvas'),
        selcCanvas = document.getElementById('lab3-selection'),
        buttNew = document.getElementById('lab3-new'),
        txtPoints = document.getElementById('lab3-p'),
        lines = [],
        srect = new SRect(selcCanvas, function (rect) {
            var wBot = new Point(rect.x, rect.y + rect.dy),
                wTop = new Point(rect.x + rect.dx, rect.y),
                width = mainCanvas.width,
                height = mainCanvas.height,
                context = mainCanvas.getContext('2d');
            context.clearRect(0, 0, width, height);
            _.each(lines, function (line) {
                line.clipLine(wBot, wTop);
                line.draw(context);
            });
        });

    function createPoints(width, height, k) {
        var save = {}, ptX, ptY, last, lines = [];
        _.times(k, function (i) {
            do {
                ptX = nextRnd(width);
                ptY = nextRnd(height);
            } while (_.has(save, ptX + '_' + ptY));
            save[ptX + '_' + ptY] = 1;
            var np = new Point(ptX, ptY);
            if (_.isUndefined(last)) {
                last = np;
            } else {
                lines.push(new Line(np, last));
                last = np;
            }
        });
        return lines;
    }

    buttNew.onclick = function () {
        var k = +txtPoints.value,
            width = mainCanvas.width,
            height = mainCanvas.height,
            context = mainCanvas.getContext('2d');
        k = !! k ? k : 0;
        lines = createPoints(width, height, k);
        context.clearRect(0, 0, width, height);
        srect.clear();
        _.each(lines, function (line) {
            line.draw(context);
        });
    }

    triggerRedrawEvent(buttNew);
}