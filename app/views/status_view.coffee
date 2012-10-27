View = require 'views/base/view'
template = require 'views/templates/status'

module.exports = class StatusView extends View
  template: template

  initialize: ->
    super
    @$("time.timeago").livequery ->
      $(@).timeago();