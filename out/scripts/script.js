(function() {
  var App, canvasDrop, dragEvent, drawLine, drop, finishDrawing, getPosition, initialize;

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

  canvasDrop = function(context) {
    return function(e) {
      var dropBoxElem, file, files, formData, i, info, reader, _i, _len;
      e = e || window.event;
      dragEvent(e);
      files = e.dataTransfer.files;
      info = "";
      formData = new FormData();
      dropBoxElem = e.currentTarget;
      for (i = _i = 0, _len = files.length; _i < _len; i = ++_i) {
        file = files[i];
        info += 'Name: ' + file.name + '<br/>Size: ' + file.size + ' bytes<br/>';
        formData.append('file', file);
        reader = new FileReader();
        reader.onload = function(event) {
          var image;
          image = new Image();
          image.src = event.target.result;
          image.width = 250;
          return context.drawImage(image, 69, 50);
        };
        reader.readAsDataURL(file);
      }
      $("#imageInfo").html(info);
      return false;
    };
  };

  initialize = function() {
    var context, element;
    element = document.getElementById("drawingCanvas");
    context = element.getContext("2d");
    context.strokeStyle = App.Globals.foreGcolour;
    element.addEventListener('dragenter', dragEvent, false);
    element.addEventListener('dragover', dragEvent, false);
    element.addEventListener('drop', canvasDrop(context), false);
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

  dragEvent = function(e) {
    e.stopPropagation();
    return e.preventDefault();
  };

  drop = function(e) {
    var dropBoxElem, file, files, formData, i, info, reader, _i, _len;
    e = e || window.event;
    dragEvent(e);
    files = e.dataTransfer.files;
    info = "";
    formData = new FormData();
    dropBoxElem = e.currentTarget;
    for (i = _i = 0, _len = files.length; _i < _len; i = ++_i) {
      file = files[i];
      info += 'Name: ' + file.name + '<br/>Size: ' + file.size + ' bytes<br/>';
      formData.append('file', file);
      reader = new FileReader();
      reader.onload = function(event) {
        var image;
        image = new Image();
        image.src = event.target.result;
        image.width = 250;
        return dropBoxElem.appendChild(image);
      };
      reader.readAsDataURL(file);
    }
    e.currentTarget.innerHTML = info;
    return false;
  };

  $(document).ready(function() {
    var dropBoxElem;
    if (window.FileReader) {
      dropBoxElem = document.getElementById("drop");
      dropBoxElem.addEventListener('dragenter', dragEvent, false);
      dropBoxElem.addEventListener('dragover', dragEvent, false);
      return dropBoxElem.addEventListener('drop', drop, false);
    } else {
      return $("#drop").html("Please use a HTML5 browser to drop and drop images");
    }
  });

}).call(this);
