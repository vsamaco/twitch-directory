Collection = require 'models/base/collection'
Stream = require 'models/stream'

module.exports = class Streams extends Collection
  model: Stream
  
  url: "https://api.twitch.tv/kraken/streams?game=League+of+Legends&limit=12"
    
  fetch: (options) ->
    super {dataType: "jsonp"}
  
  parse: (response) ->
    super
    console.log(response);
    response.streams
