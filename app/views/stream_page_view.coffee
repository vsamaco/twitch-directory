PageView = require 'views/base/page_view'
StatusView = require 'views/status_view'
template = require 'views/templates/stream_page'

module.exports = class StreamPageView extends PageView
  template: template
  container: '#content-container'
  className: 'stream-page'
    
  render: ->
    super
    @subview 'status', new StatusView ({container: @$('#status_container'), model: @model})
    @subview('status').render()