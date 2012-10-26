Model = require 'models/base/model'

module.exports = class Stream extends Model
  url: "/api/stream"
  
  initialize: (options) ->
    if options and options.name
      @url = "#{@url}/#{options.name}"
      console.log "url: #{@url}"
    else
      @url = ''
    
  parse: (response) ->
    super
    if (response.stream)
      console.log response.stream
      response.stream
    else
      if (@url)
        console.log response
      response