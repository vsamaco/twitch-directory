Model = require 'models/base/model'

module.exports = class Stream extends Model
  url: "/api/stream"
  
  initialize: (options) ->
    @url = "#{@url}/#{options.name}"
    console.log "url: #{@url}"
    
  parse: (response) ->
    super
    console.log response.stream
    response.stream