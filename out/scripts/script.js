(function() {
  var App, addEventHandler, canvasDrop, canvasDrop2, drawLine, drop, finishDrawing, getPosition, initialize, loadCanvasAndImg, stopDefault, to_image;

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
      stopDefault(e);
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
      stopDefault(e);
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

  initialize = function(canvasId) {
    var context, context2, element, element2;
    element = document.getElementById(canvasId);
    context = element.getContext("2d");
    context.strokeStyle = App.Globals.foreGcolour;
    context.lineWidth = $("#btnLinewidth").val();
    context.lineJoin = "round";
    context.lineCap = "round";
    if (canvasId === "drawingCanvas") {
      element.addEventListener('dragenter', stopDefault, false);
      element.addEventListener('dragover', stopDefault, false);
      element.addEventListener('drop', canvasDrop(context), false);
    }
    element2 = document.getElementById("resultCanvas");
    context2 = element2.getContext("2d");
    element2.width = element.width;
    element2.height = element.height;
    context2.strokeStyle = "white";
    context2.lineWidth = $("#btnLinewidth").val();
    context2.lineJoin = "round";
    context2.lineCap = "round";
    context2.fillStyle = "lightgrey";
    context2.fillRect(0, 0, element.width, element.height);
    $(element).mousedown(function(mouseEvent) {
      var position;
      position = getPosition(mouseEvent, element);
      context.moveTo(position.X, position.Y);
      context.beginPath();
      context2.moveTo(position.X, position.Y);
      context2.beginPath();
      return $(this).mousemove(function(mouseEvent) {
        position = getPosition(mouseEvent, element);
        drawLine(mouseEvent, element, context, position);
        return drawLine(mouseEvent, element2, context2, position);
      }).mouseup(function(mouseEvent) {
        position = getPosition(mouseEvent, element);
        drawLine(mouseEvent, element, context, position);
        drawLine(mouseEvent, element2, context2, position);
        finishDrawing(mouseEvent, element, context);
        return finishDrawing(mouseEvent, element2, context2);
      }).mouseout(function(mouseEvent) {
        position = getPosition(mouseEvent, element);
        drawLine(mouseEvent, element, context, position);
        drawLine(mouseEvent, element2, context2, position);
        finishDrawing(mouseEvent, element, context);
        return finishDrawing(mouseEvent, element2, context2);
      });
    });
    $("#btnClear").click(function() {
      var currentWidth, resCtx;
      currentWidth = context.lineWidth;
      element.width = element.width;
      context.lineWidth = currentWidth;
      $("#imageInfo").html('');
      resCtx = document.getElementById("resultCanvas").getContext("2d");
      resCtx.save();
      resCtx.setTransform(1, 0, 0, 1, 0, 0);
      resCtx.clearRect(0, 0, resCtx.canvas.width, resCtx.canvas.height);
      return resCtx.restore();
    });
    $("#btnForeG").click(function() {
      context.globalCompositeOperation = "source-over";
      context.strokeStyle = App.Globals.foreGcolour;
      return context2.strokeStyle = "white";
    });
    $("#btnBackG").click(function() {
      context.globalCompositeOperation = "source-over";
      context.strokeStyle = App.Globals.backGcolour;
      return context2.strokeStyle = "black";
    });
    $("#btnEraser").click(function() {
      context.globalCompositeOperation = "destination-out";
      context.strokeStyle = "rgba(0,0,0,1.0)";
      return context2.strokeStyle = "lightgrey";
    });
    return $("#btnLinewidth").change(function(event) {
      context.lineWidth = $(this).val();
      return context2.lineWidth = $(this).val();
    });
  };

  drawLine = function(mouseEvent, element, context, position) {
    context.lineTo(position.X, position.Y);
    return context.stroke();
  };

  finishDrawing = function(mouseEvent, element, context) {
    context.closePath();
    return $(element).unbind("mousemove").unbind("mouseup").unbind("mouseout");
  };

  $(document).ready(function() {
    if (!Modernizr.canvas) {
      $("#message").html("<p><b>WARNING</b>: Your browser does not support HTML5's canvas feature, you won't be able to see the drawings below</p>");
      return $("article").hide();
    } else {

    }
  });

  loadCanvasAndImg = function(id, img) {
    var $id, canvas;
    $id = $('#' + id);
    $id.empty();
    $id.width(img.width);
    $id.height(img.height);
    canvas = document.createElement('canvas');
    canvas.id = "canvasArea";
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.style.zIndex = 1;
    canvas.style.position = "absolute";
    canvas.style.border = "1px solid";
    canvas.style.cursor = "crosshair";
    canvas.onselectstart = function() {
      return false;
    };
    canvas.onmousedown = function() {
      return false;
    };
    $id.append(canvas);
    $id.append(img);
    return initialize("canvasArea");
  };

  stopDefault = function(e) {
    e.stopPropagation();
    return e.preventDefault();
  };

  drop = function(e) {
    var dropBoxElem, file, files, i, info, reader, _i, _len;
    e = e || window.event;
    stopDefault(e);
    files = e.dataTransfer.files;
    info = "";
    dropBoxElem = e.currentTarget;
    for (i = _i = 0, _len = files.length; _i < _len; i = ++_i) {
      file = files[i];
      info += 'Name: ' + file.name + '<br/>Size: ' + file.size + ' bytes<br/>';
      reader = new FileReader();
      reader.onload = function(event) {
        var image;
        image = new Image();
        image.src = event.target.result;
        return image.onload = (function(image) {
          return function(e) {
            return loadCanvasAndImg("drop", image);
          };
        })(image);
      };
      reader.readAsDataURL(file);
    }
    $("#imageInfo").html(info);
    return false;
  };

  addEventHandler = function(obj, evt, handler) {
    if (obj.addEventListener) {
      return obj.addEventListener(evt, handler, false);
    } else if (obj.attachEvent) {
      return obj.attachEvent('on' + evt, handler);
    } else {
      return obj['on' + evt] = handler;
    }
  };

  $(document).ready(function() {
    var dropBoxElem;
    if (window.FileReader) {
      dropBoxElem = document.getElementById("drop");
      addEventHandler(dropBoxElem, 'dragenter', stopDefault);
      addEventHandler(dropBoxElem, 'dragover', stopDefault);
      addEventHandler(dropBoxElem, 'dragleave', stopDefault);
      return addEventHandler(dropBoxElem, 'drop', drop);
    } else {
      return $("#drop").html("Please use a HTML5 browser to drag and drop images");
    }
  });

  to_image = function() {
    var canvas;
    console.log("drawing");
    canvas = document.getElementById("drawingCanvas");
    return document.getElementById("theimage").src = canvas.toDataURL();
  };

}).call(this);
