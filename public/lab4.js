window.lab4 = function () {
    var canvas = document.getElementById('lab4-canvas'),
        ctx = canvas.getContext('2d'),
        ctxWidth = canvas.width,
        ctxHeigh = canvas.height,
        buttonNew = document.getElementById('lab4-new'),
        buttonUndo = document.getElementById('lab4-undo'),
        txtPrec = document.getElementById('lab4-p'),
        drawMode = false,
        controlPts = [],
        defRadius = 3;

    _.each(controlPts, function (pt) {
        pt.draw(context, 'blue');
    });

    function drawBezier(context, controlPts, precission) {
        var bez = bezier(_.map(controlPts, 'arr'));
        context.beginPath();
        context.strokeStyle = 'black';
        for (var t = 0; t <= precission; t++) {
            var r = _.map(bez(t / precission), function (e) {
                return Math.floor(e);
            });
            if (t === 0) {
                context.moveTo(r[0], r[1]);
            } else {
                context.lineTo(r[0], r[1]);
            }
        }
        context.stroke();
    }
    
    function screenToCanvas(e, canv) {
        var rect = canv.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    buttonNew.onclick = function() {
        if(drawMode) {
            drawMode = false;
            if(controlPts.length) {
                var prc = +txtPrec.value;
                prc = !!prc ? prc : 1000; 
                drawBezier(ctx, controlPts, prc); 
            }
            buttonNew.innerText = 'Create points';
            buttonUndo.disabled = true; 
        } else {
            controlPts = [];
            drawMode = true;
            ctx.clearRect(0, 0, ctxWidth, ctxHeigh);
            buttonNew.innerText = 'Draw Bezier';
            buttonUndo.disabled = false;
        }
    }
    
    buttonUndo.onclick = function() {
        if(drawMode && controlPts.length) {
            var top = controlPts.pop();
            top.erase(ctx);
        }
    }
    
    canvas.onmousedown = function(e) {
        if(drawMode) {
            var coord = screenToCanvas(e, canvas),
                np = new Point(coord.x, coord.y, defRadius);
            np.draw(ctx);
            controlPts.push(np);
        }
    }
}