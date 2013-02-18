(function() {
  var App, canvasDrop, canvasDrop2, dragEvent, drawLine, drop, finishDrawing, getPosition, initialize, to_image;

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

  canvasDrop2 = function(context) {
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
        document.getElementById("drawingCanvas").width = 2000;
        reader.onload = function(event) {
          var image;
          image = new Image();
          image.src = event.target.result;
          return context.drawImage(image, 0, 0);
        };
        reader.readAsDataURL(file);
      }
      $("#imageInfo").html(info);
      return false;
    };
  };

  canvasDrop = function(context) {
    return function(e) {
      var file, files, i, image, info, _i, _len;
      e = e || window.event;
      dragEvent(e);
      files = e.dataTransfer.files;
      info = "";
      for (i = _i = 0, _len = files.length; _i < _len; i = ++_i) {
        file = files[i];
        info += 'Name: ' + file.name + '<br/>Size: ' + file.size + ' bytes<br/>';
        image = new Image();
        image.onload = (function(image, i) {
          return function(e) {
            var canvas;
            canvas = document.getElementById("drawingCanvas");
            canvas.width = image.width;
            canvas.height = image.height;
            context = canvas.getContext("2d");
            context.drawImage(image, 0, 0);
            return window.URL.revokeObjectURL(this.src);
          };
        })(image, i);
        image.src = window.URL.createObjectURL(file);
        context.drawImage(image, 0, 0);
        image = null;
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
      context.lineWidth = currentWidth;
      return $("#imageInfo").html('');
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

  to_image = function() {
    var canvas;
    console.log("drawing");
    canvas = document.getElementById("drawingCanvas");
    return document.getElementById("theimage").src = canvas.toDataURL();
  };

}).call(this);
