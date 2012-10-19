Model = require 'models/base/model'

module.exports = class Game extends Model
  defaults:
    items: [
      {name: 'League of Legends', slug: 'lol'}
      {name: 'StarCraft 2', slug: 'sc2'}
      {name: 'Dota 2', slug: 'dota2'}
    ]
