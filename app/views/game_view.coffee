template = require 'views/templates/game'
View = require 'views/base/view'
Game = require 'models/game'

module.exports = class GameView extends View
  template: template
  className: 'game nav nav-pills'
  tagName: 'ul'
  
  initialize: ->
    super
    @model ||= new Game
