Controller = require 'controllers/base/controller'
Streams = require 'models/streams'
Collection = require 'models/base/collection'
StreamsView = require 'views/streams_view'
Game = require 'models/game'
GameView = require 'views/game_view'

module.exports = class StreamsController extends Controller
  
  index: (params) ->
    console.log 'streamscontroller#index'
    @collection = new Streams 
    #[
    #  {name: 'scarra'}
    #  {name: 'dyrus'}
    #  {name: 'hotshotgg'}
    #]

    @view = new StreamsView {@collection}
    @collection.fetch()

    
    