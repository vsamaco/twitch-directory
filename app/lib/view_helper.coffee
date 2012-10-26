mediator = require 'mediator'
utils = require 'chaplin/lib/utils'

# Application-specific view helpers
# ---------------------------------

# http://handlebarsjs.com/#helpers

# Conditional evaluation
# ----------------------

# Choose block by user login status
Handlebars.registerHelper 'if_logged_in', (options) ->
  if mediator.user
    options.fn(this)
  else
    options.inverse(this)

# Map helpers
# -----------

# Make 'with' behave a little more mustachey
Handlebars.registerHelper 'with', (context, options) ->
  if not context or Handlebars.Utils.isEmpty context
    options.inverse(this)
  else
    options.fn(context)

# Inverse for 'with'
Handlebars.registerHelper 'without', (context, options) ->
  inverse = options.inverse
  options.inverse = options.fn
  options.fn = inverse
  Handlebars.helpers.with.call(this, context, options)

# Evaluate block with context being current user
Handlebars.registerHelper 'with_user', (options) ->
  context = mediator.user or {}
  Handlebars.helpers.with.call(this, context, options)


# LoL helpers
# -----------

# Champion mapping
champions = { 
  0: "N/A",
  1: "Annie",
  2: "Olaf",
  3: "Galio",
  4: "Twisted Fate",
  5: "Xin Zhao",
  6: "Urgot",
  7: "LeBlanc",
  8: "Vladimir",
  9: "Fiddlesticks",
  10: "Kayle",
  11: "Master Yi",
  12: "Alistar",
  13: "Ryze",
  14: "Sion",
  15: "Sivir",
  16: "Soraka",
  17: "Teemo",
  18: "Tristana",
  19: "Warwick",
  20: "Nunu",
  21: "Miss Fortune",
  22: "Ashe",
  23: "Tryndamere",
  24: "Jax",
  25: "Morgana",
  26: "Zilean",
  27: "Singed",
  28: "Evelynn",
  29: "Twitch", 
  30: "Karthus", 
  31: "Cho'Gath", 
  32: "Amumu", 
  33: "Rammus", 
  34: "Anivia", 
  35: "Shaco", 
  36: "Dr. Mundo", 
  37: "Sona", 
  38: "Kassadin", 
  39: "Irelia", 
  40: "Janna", 
  41: "Gangplank", 
  42: "Corki", 
  43: "Karma", 
  44: "Taric", 
  45: "Veigar", 
  48: "Trundle", 
  50: "Swain", 
  51: "Caitlyn",
  53: "Blitzcrank", 
  54: "Malphite", 
  55: "Katarina", 
  56: "Nocturne", 
  57: "Maokai", 
  58: "Renekton", 
  59: "Jarvan IV", 
  61: "Orianna", 
  62: "Wukong", 
  63: "Brand", 
  64: "Lee Sin", 
  67: "Vayne", 
  68: "Rumble", 
  69: "Cassiopeia", 
  72: "Skarner", 
  74: "Heimerdinger", 
  75: "Nasus", 
  76: "Nidalee", 
  77: "Udyr", 
  78: "Poppy", 
  79: "Gragas", 
  80: "Pantheon", 
  81: "Ezreal", 
  82: "Mordekaiser", 
  83: "Yorick", 
  84: "Akali", 
  85: "Kennen", 
  86: "Garen", 
  89: "Leona", 
  90: "Malzahar", 
  91: "Talon", 
  92: "Riven", 
  96: "Kog'Maw", 
  98: "Shen", 
  99: "Lux", 
  101: "Xerath", 
  102: "Shyvana", 
  103: "Ahri", 
  104: "Graves", 
  105: "Fizz", 
  106: "Volibear", 
  107: "Rengar", 
  110: "Varus", 
  111: "Nautilus", 
  112: "Viktor", 
  113: "Sejuani", 
  114: "Fiora", 
  115: "Ziggs", 
  117: "Lulu", 
  119: "Draven", 
  120: "Hecarim", 
  122: "Darius", 
  126: "Jayce", 
  131: "Diana", 
  134: "Syndra", 
  143: "Zyra"
}
  
# Game status
Handlebars.registerHelper 'lol_games', (context) ->
  result = ''
  
  # Iterate list of games
  for game in this.lolGames
    result += "<li>#{game.type}</li>"
    result += "<li>#{game.state}</li>" if game.state
    # Output current summoner champion
    for champion in game.champions 
      result += "<li>#{champions[champion.championId]}</li>" if champion.summonerInternalName is this.summonerName
  
  return new Handlebars.SafeString result

# Champion lookup
Handlebars.registerHelper 'champion', (context, options) ->
  champions[context]
