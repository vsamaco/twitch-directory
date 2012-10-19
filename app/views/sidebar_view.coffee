View = require 'views/base/view'
Game = require 'models/game'
GameView = require 'views/game_view'
template = require 'views/templates/sidebar'

module.exports = class SidebarView extends View
  template: template
  
  id: 'sidebar'
  container: '#sidebar-container'
  autoRender: true
  
  initialize: ->
    super
    
  render: ->
    super

    @subview 'games', new GameView {container: @$('#games-container')}
    ['games'].forEach (name) =>
      @subview(name).render()
