View = require 'views/base/view'
template = require 'views/templates/stream'

module.exports = class StreamView extends View
  template: template
  className: 'stream'
  tagName: 'li'
  events: {
    "hover .screenshot" : 'toggleScreenshot'
  }
  
  toggleScreenshot: (e) =>    
    switch e.type
      when 'mouseenter'
        @.$(".stream-over").stop().fadeTo('fast', 1);
      when 'mouseleave'
        @.$(".stream-over").stop().fadeTo('fast', 0);

    