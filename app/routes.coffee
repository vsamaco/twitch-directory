module.exports = (match) ->
  match '', 'streams#index'
  match 'stream/:name', 'streams#show'
