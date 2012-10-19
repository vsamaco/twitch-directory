Collection = require 'models/base/collection'
Streams = require 'models/streams'
Streams = require 'models/streams'

describe 'Streams', ->
  beforeEach ->
    @model = new Streams()
    @collection = new Streams()

  afterEach ->
    @model.dispose()
    @collection.dispose()
