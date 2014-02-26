window.triggerRedrawEvent = function (btn) {
    var event = document.createEvent("HTMLEvents");
    event.initEvent("click", true, true);
    btn.dispatchEvent(event);
}

window.nextRnd = function nextRnd(b) {
    return Math.floor(Math.random() * b);
}