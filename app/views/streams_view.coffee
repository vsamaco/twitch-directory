CollectionView = require 'views/base/collection_view'
StreamView = require 'views/stream_view'
template = require 'views/templates/streams'

module.exports = class StreamsView extends CollectionView
  template: template
  
  tagName: 'div'
  id: 'streams'
  
  itemView: StreamView
  container: '#content-container'
  listSelector: '.streams' # Append the item views to this element
  fallbackSelector: '.fallback'
  
  initialize: ->
    console.log 'streamsview#initialize'
    super
    
  render: ->
    super
    console.log 'Render'
    @.$("")

    
  insertView: (item, view, index = null, enableAnimation = true) ->
    super

    # Add row-end class to last element in row
    view.$el.addClass('row-end') if index % 3 is 0 and index != 0
