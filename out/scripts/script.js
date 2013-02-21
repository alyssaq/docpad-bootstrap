(function() {
  var App, addEventHandler, clearBtn, drawLine, drawLines, finishDrawings, getPosition, imgSelectHandler, initialize, loadCanvasAndImg, parseImg, stopDefault;

  App = App || {
    Globals: {
      foreGcolour: $("#btnForeG").css('backgroundColor'),
      backGcolour: $("#btnBackG").css('backgroundColor')
    }
  };

  clearBtn = function(srcCtx, resCtx) {
    srcCtx.save();
    srcCtx.setTransform(1, 0, 0, 1, 0, 0);
    srcCtx.clearRect(0, 0, resCtx.canvas.width, resCtx.canvas.height);
    srcCtx.restore();
    resCtx.save();
    resCtx.setTransform(1, 0, 0, 1, 0, 0);
    resCtx.clearRect(0, 0, resCtx.canvas.width, resCtx.canvas.height);
    return resCtx.restore();
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

  drawLine = function(context, position) {
    context.lineTo(position.X, position.Y);
    return context.stroke();
  };

  drawLines = function(srcCtx, resCtx, position) {
    drawLine(srcCtx, position);
    return drawLine(resCtx, position);
  };

  finishDrawings = function(srcCtx, resCtx, position) {
    drawLines(srcCtx, resCtx, position);
    srcCtx.closePath();
    resCtx.closePath();
    return $(srcCtx.canvas).unbind("mousemove").unbind("mouseup").unbind("mouseout");
  };

  initialize = function(srcCanvas) {
    var resCanvas, resCtx, srcCtx;
    srcCtx = srcCanvas.getContext("2d");
    srcCtx.strokeStyle = App.Globals.foreGcolour;
    resCanvas = document.getElementById("resultCanvas");
    resCtx = resCanvas.getContext("2d");
    resCanvas.width = srcCanvas.width;
    resCanvas.height = srcCanvas.height;
    srcCtx.lineWidth = resCtx.lineWidth = $("#btnLinewidth").val();
    srcCtx.lineJoin = resCtx.lineJoin = "round";
    srcCtx.lineCap = resCtx.lineCap = "round";
    resCtx.strokeStyle = "white";
    resCtx.fillStyle = "lightgrey";
    resCtx.fillRect(0, 0, srcCanvas.width, srcCanvas.height);
    $(srcCanvas).mousedown(function(mouseEvent) {
      var position;
      position = getPosition(mouseEvent, srcCanvas);
      srcCtx.moveTo(position.X, position.Y);
      srcCtx.beginPath();
      resCtx.moveTo(position.X, position.Y);
      resCtx.beginPath();
      return $(this).mousemove(function(mouseEvent) {
        position = getPosition(mouseEvent, srcCanvas);
        return drawLines(srcCtx, resCtx, position);
      }).mouseup(function(mouseEvent) {
        position = getPosition(mouseEvent, srcCanvas);
        return finishDrawings(srcCtx, resCtx, position);
      }).mouseout(function(mouseEvent) {
        position = getPosition(mouseEvent, srcCanvas);
        return finishDrawings(srcCtx, resCtx, position);
      });
    });
    $("#btnClear").click(function() {
      return clearBtn(srcCtx, resCtx);
    });
    $("#btnForeG").click(function() {
      srcCtx.globalCompositeOperation = "source-over";
      srcCtx.strokeStyle = App.Globals.foreGcolour;
      return resCtx.strokeStyle = "white";
    });
    $("#btnBackG").click(function() {
      srcCtx.globalCompositeOperation = "source-over";
      srcCtx.strokeStyle = App.Globals.backGcolour;
      return resCtx.strokeStyle = "black";
    });
    $("#btnEraser").click(function() {
      srcCtx.globalCompositeOperation = "destination-out";
      srcCtx.strokeStyle = "rgba(0,0,0,1.0)";
      return resCtx.strokeStyle = "lightgrey";
    });
    return $("#btnLinewidth").change(function() {
      return srcCtx.lineWidth = resCtx.lineWidth = $(this).val();
    });
  };

  loadCanvasAndImg = function(id, img) {
    var $id, canvas;
    $id = $('#' + id);
    $id.empty();
    $id.width(img.width);
    $id.height(img.height);
    if (Modernizr.canvas) {
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
      canvas.ondragover = function() {
        $id.addClass("hover");
        return false;
      };
      $id.append(canvas);
      initialize(canvas);
    }
    $id.append(img);
    return $id.removeClass("hover");
  };

  stopDefault = function(e) {
    e.stopPropagation();
    e.preventDefault();
    return e.target.className = e.type === "dragover" ? "hover" : "";
  };

  parseImg = function(file) {
    var info, reader;
    info = 'Name: ' + file.name + '<br/>Size: ' + file.size + ' bytes<br/>';
    reader = new FileReader();
    reader.onload = function(e) {
      var image;
      image = new Image();
      image.id = "dropImg";
      image.src = event.target.result;
      return image.onload = (function(image) {
        return function(e) {
          loadCanvasAndImg("drop", image);
          return $("#imageInfo").html(info);
        };
      })(image);
    };
    return reader.readAsDataURL(file);
  };

  imgSelectHandler = function(e) {
    var f, files, _i, _len;
    e = e || window.event;
    stopDefault(e);
    files = e.target.files || e.dataTransfer.files;
    for (_i = 0, _len = files.length; _i < _len; _i++) {
      f = files[_i];
      if (f.type.indexOf("image") === 0) {
        parseImg(f);
      }
    }
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
    var dropBoxElem, xhr;
    if (window.File && window.FileList && window.FileReader) {
      addEventHandler(document.getElementById("imgSelect"), "change", imgSelectHandler);
      xhr = new XMLHttpRequest();
      if (xhr.upload) {
        dropBoxElem = document.getElementById("drop");
        addEventHandler(dropBoxElem, 'dragover', stopDefault);
        addEventHandler(dropBoxElem, 'dragleave', stopDefault);
        addEventHandler(dropBoxElem, 'drop', imgSelectHandler);
        return dropBoxElem.style.display = "block";
      }
    } else {
      return $("#imageInfo").html("Your browser does not support drag and drop of images");
    }
  });

}).call(this);
