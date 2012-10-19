View = require 'views/base/view'
template = require 'views/templates/navigation'

module.exports = class HeaderView extends View
  template: template
  className: 'navigation'
  container: '#navigation-container'
  autoRender: true

  initialize: ->
    super
    @subscribeEvent 'loginStatus', @render
    @subscribeEvent 'startupController', @render
