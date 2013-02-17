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

initialize = ->
  # get references to the canvas element as well as the 2D drawing context
  element             = document.getElementById("drawingCanvas")
  context             = element.getContext("2d")
  context.strokeStyle = App.Globals.foreGcolour
  # start drawing when the mousedown event fires, and attach handlers to 
  # draw a line to wherever the mouse moves to
  $("#drawingCanvas").mousedown (mouseEvent) ->
    position = getPosition(mouseEvent, element)
    context.moveTo position.X, position.Y
    context.beginPath()
    
    # attach event handlers
    $(this).mousemove((mouseEvent) ->
      drawLine mouseEvent, element, context
    ).mouseup((mouseEvent) ->
      finishDrawing mouseEvent, element, context
    ).mouseout (mouseEvent) ->
      finishDrawing mouseEvent, element, context

  # clear the content of the canvas by resizing the element
  $("#btnClear").click ->
    # remember the current line width
    currentWidth      = context.lineWidth
    element.width     = element.width
    context.lineWidth = currentWidth
  
  #Change the line colour depending on fore/background
  $("#btnForeG").click ->
    context.strokeStyle = App.Globals.foreGcolour
  $("#btnBackG").click ->
    context.strokeStyle = App.Globals.backGcolour

  # change the line width
  $("#btnLinewidth").change (event) ->
    context.lineWidth = event.target.value unless isNaN(event.target.value)


# draws a line to the x and y coordinates of the mouse event inside
# the specified element using the specified context
drawLine   = (mouseEvent, element, context) ->
  position = getPosition(event, element)
  context.lineTo position.X, position.Y
  context.stroke()

# draws a line from the last coordiantes in the path to the finishing
# coordinates and unbind any event handlers which need to be preceded
# by the mouse down event
finishDrawing = (mouseEvent, element, context) ->
  # draw the line to the finishing coordinates
  drawLine mouseEvent, element, context
  context.closePath()
  
  # unbind any events which could draw
  $(element).unbind("mousemove").unbind("mouseup").unbind "mouseout"

$(document).ready ->
  unless Modernizr.canvas
    $("#message").html "<p><b>WARNING</b>: Your browser does not support HTML5's canvas feature, you won't be able to see the drawings below</p>"
    $("article").hide()
  else
    initialize()
