Collection = require 'models/base/collection'
Games = require 'models/games'
Games = require 'models/games'

describe 'Games', ->
  beforeEach ->
    @model = new Games()
    @collection = new Games()

  afterEach ->
    @model.dispose()
    @collection.dispose()
