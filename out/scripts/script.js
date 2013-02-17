(function() {
  var App, drawLine, finishDrawing, getPosition, initialize;

  App = App || {
    Globals: {
      foreGcolour: '#0044cc',
      backGcolour: '#000000'
    }
  };

  getPosition = function(mouseEvent, element) {
    var x, y;
    x = void 0;
    y = void 0;
    if (mouseEvent.pageX && mouseEvent.pageY) {
      x = mouseEvent.pageX;
      y = mouseEvent.pageY;
    } else {
      x = mouseEvent.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      y = mouseEvent.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    return {
      X: x - element.offsetLeft,
      Y: y - element.offsetTop
    };
  };

  initialize = function() {
    var context, element;
    element = document.getElementById("drawingCanvas");
    context = element.getContext("2d");
    context.strokeStyle = App.Globals.foreGcolour;
    $("#drawingCanvas").mousedown(function(mouseEvent) {
      var position;
      position = getPosition(mouseEvent, element);
      context.moveTo(position.X, position.Y);
      context.beginPath();
      return $(this).mousemove(function(mouseEvent) {
        return drawLine(mouseEvent, element, context);
      }).mouseup(function(mouseEvent) {
        return finishDrawing(mouseEvent, element, context);
      }).mouseout(function(mouseEvent) {
        return finishDrawing(mouseEvent, element, context);
      });
    });
    $("#btnClear").click(function() {
      var currentWidth;
      currentWidth = context.lineWidth;
      element.width = element.width;
      return context.lineWidth = currentWidth;
    });
    $("#btnForeG").click(function() {
      return context.strokeStyle = App.Globals.foreGcolour;
    });
    $("#btnBackG").click(function() {
      return context.strokeStyle = App.Globals.backGcolour;
    });
    return $("#btnLinewidth").change(function(event) {
      if (!isNaN(event.target.value)) {
        return context.lineWidth = event.target.value;
      }
    });
  };

  drawLine = function(mouseEvent, element, context) {
    var position;
    position = getPosition(event, element);
    context.lineTo(position.X, position.Y);
    return context.stroke();
  };

  finishDrawing = function(mouseEvent, element, context) {
    drawLine(mouseEvent, element, context);
    context.closePath();
    return $(element).unbind("mousemove").unbind("mouseup").unbind("mouseout");
  };

  $(document).ready(function() {
    if (!Modernizr.canvas) {
      $("#message").html("<p><b>WARNING</b>: Your browser does not support HTML5's canvas feature, you won't be able to see the drawings below</p>");
      return $("article").hide();
    } else {
      return initialize();
    }
  });

}).call(this);
