Collection = require 'models/base/collection'
Stream = require 'models/stream'

module.exports = class Streams extends Collection
  model: Stream
  
  url: "/api/streams/League of Legends"
    
  # fetch: (options) ->
  #   super {dataType: "jsonp"}
  
  parse: (response) ->
    super
    # console.log(response);
    # response.streams
