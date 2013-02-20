# display a warning message if canvas is not supported
#http://theburningmonk.com/2011/01/having-fun-with-html5-canvas-part-2/
# works out the X, Y position of the click INSIDE the canvas from the X, Y position on 
# the page

App = App || Globals: {foreGcolour: '#0044cc', backGcolour: '#000000'}

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

canvasDrop2 = (context) ->
  (e) ->
    e = e || window.event # get window.event if e argument missing (in IE)  
    stopDefault e
    files = e.dataTransfer.files
    info  = ""
    formData = new FormData()
    dropBoxElem = e.currentTarget
    for file, i in files       
      info += 'Name: '+file.name+'<br/>Size: '+file.size+' bytes<br/>'
      formData.append 'file', file
      reader = new FileReader()
      document.getElementById("drawingCanvas").width = 2000
      reader.onload = (event) ->
        image       = new Image();
        image.src   = event.target.result
        #image.width = 250 # a fake resize
        context.drawImage(image, 0, 0)
      reader.readAsDataURL file
    $("#imageInfo").html info
    false

canvasDrop = (context) ->
  (e) ->
    e = e || window.event
    stopDefault e
    files = e.dataTransfer.files
    info  = ""
    for file, i in files
      info += 'Name: '+file.name+'<br/>Size: '+file.size+' bytes<br/>'
      image = new Image()
      image.onload = ((image, i) ->
        (e) ->
          # Size adjustment 
          canvas  = document.getElementById("drawingCanvas")
          canvas.width = image.width
          canvas.height = image.height
          context = canvas.getContext("2d")
          context.drawImage image, 0, 0
  #(canvas.height - image.height) / 2, 2, image.width, image.height
          window.URL.revokeObjectURL @src
      )(image, i)
      image.src = window.URL.createObjectURL file
      context.drawImage(image, 0, 0)
      image = null
    $("#imageInfo").html info
    false


initialize = (canvasId)->
  # get references to the canvas element as well as the 2D drawing context
  element             = document.getElementById(canvasId)
  context             = element.getContext("2d")
  context.strokeStyle = App.Globals.foreGcolour
  context.lineWidth   = $("#btnLinewidth").val()
  context.lineJoin    = "round"
  context.lineCap     = "round"

  if canvasId == "drawingCanvas"
    element.addEventListener 'dragenter', stopDefault, false
    element.addEventListener 'dragover' , stopDefault, false
    element.addEventListener 'drop'     , canvasDrop(context), false

  element2 = document.getElementById("resultCanvas") 
  context2 = element2.getContext("2d")
  element2.width       = element.width
  element2.height       = element.height
  context2.strokeStyle = "white"
  context2.lineWidth   = $("#btnLinewidth").val()
  context2.lineJoin    = "round"
  context2.lineCap     = "round"
  context2.fillStyle   = "lightgrey";
  context2.fillRect(0, 0, element.width, element.height);

  # start drawing when the mousedown event fires, and attach handlers to 
  # draw a line to wherever the mouse moves to
  $(element).mousedown (mouseEvent) ->
    position = getPosition(mouseEvent, element)
    context.moveTo position.X, position.Y
    context.beginPath()
    context2.moveTo position.X, position.Y
    context2.beginPath()
    # attach event handlers
    $(this).mousemove((mouseEvent) ->
      position = getPosition(mouseEvent, element)
      drawLine mouseEvent, element, context, position
      drawLine mouseEvent, element2, context2, position
    ).mouseup((mouseEvent) ->
      position = getPosition(mouseEvent, element)
      drawLine mouseEvent, element, context, position
      drawLine mouseEvent, element2, context2, position
      finishDrawing mouseEvent, element, context
      finishDrawing mouseEvent, element2, context2
    ).mouseout (mouseEvent) ->
      position = getPosition(mouseEvent, element)
      drawLine mouseEvent, element, context, position
      drawLine mouseEvent, element2, context2, position
      finishDrawing mouseEvent, element, context
      finishDrawing mouseEvent, element2, context2

  #Clear
  $("#btnClear").click ->
    # remember the current line width
    currentWidth      = context.lineWidth
    element.width     = element.width
    context.lineWidth = currentWidth
    $("#imageInfo").html ''
    # clear the content of the canvas 
    resCtx = document.getElementById("resultCanvas").getContext("2d")
    resCtx.save();
    # Use the identity matrix while clearing the canvas
    resCtx.setTransform(1, 0, 0, 1, 0, 0);
    resCtx.clearRect(0, 0, resCtx.canvas.width, resCtx.canvas.height);
    # Restore the transform
    resCtx.restore();
  
  #Change the line colour depending on fore/background
  $("#btnForeG").click ->
    context.strokeStyle  = App.Globals.foreGcolour
    context2.strokeStyle = "white"
  $("#btnBackG").click ->
    context.strokeStyle  = App.Globals.backGcolour
    context2.strokeStyle = "black"
  $("#btnEraser").click ->
    context.globalCompositeOperation  = "destination-out"
    context.strokeStyle               = "rgba(255,255,255,1.0)"
    context2.strokeStyle              = "lightgrey"

  # change the line width
  $("#btnLinewidth").change (event) ->
    context.lineWidth = $(this).val()

# draws a line to the x and y coordinates of the mouse event inside
# the specified element using the specified context
drawLine   = (mouseEvent, element, context, position) ->
  #position = getPosition(mouseEvent, element)
  context.lineTo position.X, position.Y
  context.stroke()

# draws a line from the last coordiantes in the path to the finishing
# coordinates and unbind any event handlers which need to be preceded
# by the mouse down event
finishDrawing = (mouseEvent, element, context) ->
  # draw the line to the finishing coordinates
  #drawLine mouseEvent, element, context
  context.closePath()
  
  # unbind any events which could draw
  $(element).unbind("mousemove").unbind("mouseup").unbind "mouseout"

$(document).ready ->
  unless Modernizr.canvas
    $("#message").html "<p><b>WARNING</b>: Your browser does not support HTML5's canvas feature, you won't be able to see the drawings below</p>"
    $("article").hide()
  else
    #initialize("drawingCanvas")

#Drag and drop events
loadCanvasAndImg = (id, img) ->
  $id = $('#' + id)
  $id.empty()
  $id.width  img.width
  $id.height img.height
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
  $id.append canvas
  $id.append img
  initialize "canvasArea"

stopDefault = (e) ->
  e.stopPropagation()
  e.preventDefault()

drop = (e) ->
  e = e || window.event; # get window.event if e argument missing (in IE)  
  stopDefault e
  files = e.dataTransfer.files
  info  = ""
  #formData = new FormData()
  dropBoxElem = e.currentTarget
  for file, i in files       
    info += 'Name: '+file.name+'<br/>Size: '+file.size+' bytes<br/>'
    #formData.append 'file', file
    reader = new FileReader()
    reader.onload = (event) ->
      image       = new Image();
      image.src   = event.target.result
      image.onload = ((image) -> 
        (e) ->
          loadCanvasAndImg "drop", image
      )(image)
    reader.readAsDataURL file
  #e.currentTarget.innerHTML = info
  $("#imageInfo").html info
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
  if window.FileReader
    dropBoxElem = document.getElementById("drop")
    addEventHandler dropBoxElem, 'dragenter', stopDefault
    addEventHandler dropBoxElem, 'dragover' , stopDefault
    addEventHandler dropBoxElem, 'dragleave', stopDefault
    addEventHandler dropBoxElem, 'drop'     , drop
  else
    $("#drop").html "Please use a HTML5 browser to drag and drop images"

to_image = ->
  console.log "drawing"
  canvas = document.getElementById("drawingCanvas")
  document.getElementById("theimage").src = canvas.toDataURL();
