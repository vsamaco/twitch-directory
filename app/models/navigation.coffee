Model = require 'models/base/model'

module.exports = class Navigation extends Model
  defaults:
    items: [
      {href: '/', title: 'Home'}
    ]