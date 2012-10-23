Controller = require 'controllers/base/controller'
Streams = require 'models/streams'
Collection = require 'models/base/collection'
StreamsView = require 'views/streams_view'
Game = require 'models/game'
GameView = require 'views/game_view'
Stream = require 'models/stream'
StreamPageView = require 'views/stream_page_view'

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

  show: (params) ->
    console.log "streams#show(#{params.name})"
    @model = new Stream ({name: params.name});
    @view = new StreamPageView ({@model})
    @model.fetch()

    