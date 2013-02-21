# display a warning message if canvas is not supported
#http://theburningmonk.com/2011/01/having-fun-with-html5-canvas-part-2/
# works out the X, Y position of the click INSIDE the canvas from the X, Y position on 
# the page

App = App || Globals: {foreGcolour: $("#btnForeG").css('backgroundColor'), backGcolour: $("#btnBackG").css('backgroundColor')}

#Events
clearBtn = (resCtx) ->
  $("#drop").empty().html("Or drop image here!")
  $("#drop").width(300)
  $("#drop").height(300)
  # remember the current line width
  $("#imageInfo").html ''
  # clear the content of the canvas 
  resCtx.save()
  # Use the identity matrix while clearing the canvas
  resCtx.setTransform(1, 0, 0, 1, 0, 0)
  resCtx.clearRect(0, 0, resCtx.canvas.width, resCtx.canvas.height)
  # Restore the transform
  resCtx.restore()

getPosition = (mouseEvent, element) ->
  x = undefined
  y = undefined
  if mouseEvent.pageX and mouseEvent.pageY
    x = mouseEvent.pageX
    y = mouseEvent.pageY
  else
    x = mouseEvent.clientX + document.body.scrollLeft + document.documentElement.scrollLeft
    y = mouseEvent.clientY + document.body.scrollTop + document.documentElement.scrollTop
  X: x - element.offsetLeft, Y: y - element.offsetTop

# draws a line to the x and y coordinates of the mouse event inside
# the specified element using the specified context
drawLine  = (context, position) ->
  context.lineTo position.X, position.Y
  context.stroke()
#draw lines on the src and result canvas
drawLines = (srcCtx, resCtx, position) ->
  drawLine srcCtx, position
  drawLine resCtx, position

# finish drawing on the src and result canvas given the end position
finishDrawings = (srcCtx, resCtx, position) ->
  # draw the line to the finishing coordinates
  drawLines srcCtx, resCtx, position
  srcCtx.closePath() 
  resCtx.closePath()
  # unbind any events which could draw
  $(srcCtx.canvas).unbind("mousemove").unbind("mouseup").unbind "mouseout"

initialize = (srcCanvas)->
  # get references to the canvas element as well as the 2D drawing context
  srcCtx             = srcCanvas.getContext "2d"
  srcCtx.strokeStyle = App.Globals.foreGcolour

  resCanvas          = document.getElementById "resultCanvas"
  resCtx             = resCanvas.getContext "2d"
  resCanvas.width    = srcCanvas.width
  resCanvas.height   = srcCanvas.height

  srcCtx.lineWidth   = resCtx.lineWidth = $("#btnLinewidth").val()
  srcCtx.lineJoin    = resCtx.lineJoin  = "round"
  srcCtx.lineCap     = resCtx.lineCap   = "round"

  resCtx.strokeStyle = "white"
  resCtx.fillStyle   = "lightgrey"
  resCtx.fillRect 0, 0, srcCanvas.width, srcCanvas.height

  # start drawing when the mousedown event fires, and attach handlers to 
  # draw a line to wherever the mouse moves to
  $(srcCanvas).mousedown (mouseEvent) ->
    position = getPosition(mouseEvent, srcCanvas)
    srcCtx.moveTo position.X, position.Y
    srcCtx.beginPath()
    resCtx.moveTo position.X, position.Y
    resCtx.beginPath()
    # attach event handlers
    $(this).mousemove((mouseEvent) ->
      position = getPosition(mouseEvent, srcCanvas)
      drawLines srcCtx, resCtx, position
    ).mouseup((mouseEvent) ->
      position = getPosition(mouseEvent, srcCanvas)
      finishDrawings srcCtx, resCtx, position
    ).mouseout (mouseEvent) ->
      position = getPosition(mouseEvent, srcCanvas)
      finishDrawings srcCtx, resCtx, position

  #Clear
  $("#btnClear").click -> clearBtn(resCtx)

  #Change the line colour depending on fore/background
  $("#btnForeG").click ->
    srcCtx.globalCompositeOperation = "source-over"
    srcCtx.strokeStyle = App.Globals.foreGcolour
    resCtx.strokeStyle = "white"
  $("#btnBackG").click ->
    srcCtx.globalCompositeOperation = "source-over"
    srcCtx.strokeStyle = App.Globals.backGcolour
    resCtx.strokeStyle = "black"
  $("#btnEraser").click ->
    srcCtx.globalCompositeOperation = "destination-out"
    srcCtx.strokeStyle              = "rgba(0,0,0,1.0)"
    resCtx.strokeStyle              = "lightgrey"

  # change the line width
  $("#btnLinewidth").change () ->
    srcCtx.lineWidth = resCtx.lineWidth = $(this).val()

#Drag and drop events
loadCanvasAndImg = (id, img) ->
  $id = $('#' + id)
  $id.empty()
  $id.width  img.width
  $id.height img.height
  if Modernizr.canvas
    canvas                = document.createElement 'canvas'
    canvas.id             = "canvasArea"
    canvas.width          = img.width
    canvas.height         = img.height
    canvas.style.zIndex   = 1
    canvas.style.position = "absolute"
    canvas.style.border   = "1px solid"
    canvas.style.cursor   = "crosshair"
    canvas.onselectstart  = () -> false # IE: disable text selection
    canvas.onmousedown    = () -> false # mozilla: disable text selection
    canvas.ondragover     = (e) -> $id.addClass "hover"; false
    canvas.ondragleave    = (e) -> $id.removeClass "hover"; false
    $id.append canvas
    initialize canvas
  $id.append img

stopDefault = (e) ->
  e.stopPropagation()
  e.preventDefault()
  e.target.className = if e.type == "dragover" then "hover" else ""

parseImg = (file) ->
  info   = 'Name: '+file.name+'<br/>Size: '+file.size+' bytes<br/>'
  reader = new FileReader();
  reader.onload = (e) ->
    image       = new Image()
    image.id    = "dropImg"
    image.src   = event.target.result
    image.onload = ((image) -> 
      (e) ->
        loadCanvasAndImg "drop", image
        $("#imageInfo").html info
    )(image)
  reader.readAsDataURL file

imgSelectHandler = (e) ->
  e = e || window.event; # get window.event if e argument missing (in IE)  
  stopDefault e
  files = e.target.files || e.dataTransfer.files
  # Process image files
  parseImg f for f in files when f.type.indexOf("image") is 0
  false

# cross-browser addEventHandler()  
addEventHandler = (obj, evt, handler) ->
  if obj.addEventListener # W3C method
    obj.addEventListener(evt, handler, false)
  else if obj.attachEvent # IE method
    obj.attachEvent('on' + evt, handler)
  else # Old school method
    obj['on' + evt] = handler
    
$(document).ready ->
  if window.File && window.FileList && window.FileReader
    addEventHandler document.getElementById("imgSelect"), "change", imgSelectHandler

    xhr = new XMLHttpRequest()
    if xhr.upload
      # file drag-drop
      dropBoxElem = document.getElementById("drop")
      addEventHandler dropBoxElem, 'dragover' , stopDefault
      addEventHandler dropBoxElem, 'dragleave', stopDefault
      addEventHandler dropBoxElem, 'drop'     , imgSelectHandler
      dropBoxElem.style.display = "block"
      #submitbutton.style.display = "none";
  else
    $("#imageInfo").html "Your browser does not support drag and drop of images"