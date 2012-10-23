PageView = require 'views/base/page_view'
template = require 'views/templates/stream_page'

module.exports = class StreamPageView extends PageView
  template: template
  container: '#content-container'
  