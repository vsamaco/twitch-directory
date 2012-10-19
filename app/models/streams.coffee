Collection = require 'models/base/collection'
Stream = require 'models/stream'

module.exports = class Streams extends Collection
  model: Stream
  
  url: "http://localhost:8080/streams/League%20of%20Legends"
  
  parse: (response) ->
    super
    console.log(response);
    response.streams
