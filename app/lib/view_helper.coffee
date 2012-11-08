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

#Items mapping
items = {
  0: "None",
  1001: "Boots of Speed",
  1004: "Faerie Charm",
  1005: "Meki Pendant",
  1006: "Rejuvenation Bead",
  1007: "Regrowth Pendant",
  1011: "Giant's Belt",
  1018: "Cloak of Agility",
  1026: "Blasting Wand",
  1027: "Sapphire Crystal",
  1028: "Ruby Crystal",
  1029: "Cloth Armor",
  1031: "Chain Vest",
  1033: "Null-Magic Mantle",
  1036: "Long Sword",
  1037: "Pickaxe",
  1038: "B. F. Sword",
  1042: "Dagger",
  1043: "Recurve Bow",
  1051: "Brawler's Gloves",
  1052: "Amplifying Tome",
  1053: "Vampiric Scepter",
  1054: "Doran's Shield",
  1055: "Doran's Blade",
  1056: "Doran's Ring",
  1057: "Negatron Cloak",
  1058: "Needlessly Large Rod",
  1062: "Prospector's Blade",
  1063: "Prospector's Ring",
  2003: "Health Potion",
  2004: "Mana Potion",
  2037: "Elixir of Fortitude",
  2038: "Elixir of Agility",
  2039: "Elixir of Brilliance",
  2040: "Ichor of Rage",
  2042: "Oracle's Elixir",
  2043: "Vision Ward",
  2044: "Sight Ward",
  2047: "Oracle's Extract",
  2048: "Ichor of Illumination",
  3001: "Abyssal Scepter",
  3003: "Archangel's Staff",
  3004: "Manamune",
  3005: "Atma's Impaler",
  3006: "Berserker's Greaves",
  3009: "Boots of Swiftness",
  3010: "Catalyst the Protector",
  3020: "Sorcerer's Shoes",
  3022: "Frozen Mallet",
  3024: "Glacial Shroud",
  3026: "Guardian Angel",
  3027: "Rod of Ages",
  3028: "Chalice of Harmony",
  3031: "Infinity Edge",
  3035: "Last Whisper",
  3037: "Mana Manipulator",
  3041: "Mejai's Soulstealer",
  3044: "Phage",
  3046: "Phantom Dancer",
  3047: "Ninja Tabi",
  3050: "Zeke's Herald",
  3057: "Sheen",
  3065: "Spirit Visage",
  3067: "Kindlegem",
  3068: "Sunfire Cape",
  3069: "Shurelya's Reverie",
  3070: "Tear of the Goddess",
  3071: "The Black Cleaver",
  3072: "The Bloodthirster",
  3075: "Thornmail",
  3077: "Tiamat",
  3078: "Trinity Force",
  3082: "Warden's Mail",
  3083: "Warmog's Armor",
  3084: "Overlord's Bloodmail",
  3086: "Zeal",
  3089: "Rabadon's Deathcap",
  3090: "Wooglet's Witchcap",
  3091: "Wit's End",
  3093: "Avarice Blade",
  3096: "Philosopher's Stone",
  3097: "Emblem of Valor",
  3098: "Kage's Lucky Pick",
  3099: "Soul Shroud",
  3100: "Lich Bane",
  3101: "Stinger",
  3102: "Banshee's Veil",
  3104: "Lord Van Damm's Pillager",
  3105: "Aegis of the Legion",
  3106: "Madred's Razors",
  3108: "Fiendish Codex",
  3109: "Force of Nature",
  3110: "Frozen Heart",
  3111: "Mercury's Treads",
  3114: "Malady",
  3115: "Nashor's Tooth",
  3116: "Rylai's Crystal Scepter",
  3117: "Boots of Mobility",
  3122: "Wicked Hatchet",
  3123: "Executioner's Calling",
  3124: "Guinsoo's Rageblade",
  3126: "Madred's Bloodrazor",
  3128: "Deathfire Grasp",
  3132: "Heart of Gold",
  3134: "The Brutalizer",
  3135: "Void Staff",
  3136: "Haunting Guise",
  3138: "Leviathan",
  3140: "Quicksilver Sash",
  3141: "Sword of the Occult",
  3142: "Youmuu's Ghostblade",
  3143: "Randuin's Omen",
  3144: "Bilgewater Cutlass",
  3145: "Hextech Revolver",
  3146: "Hextech Gunblade",
  3152: "Will of the Ancients",
  3153: "Blade of the Ruined King",
  3154: "Wriggle's Lantern",
  3155: "Hexdrinker",
  3156: "Maw of Malmortius",
  3157: "Zhonya's Hourglass",
  3158: "Ionian Boots of Lucidity",
  3159: "Grez's Spectral Lantern",
  3165: "Morello's Evil Tome",
  3166: "Bonetooth Necklace",
  3170: "Moonflair Spellblade",
  3172: "Cloak and Dagger",
  3173: "Eleisa's Miracle",
  3174: "Athene's Unholy Grail",
  3178: "Ionic Spark",
  3180: "Odyn's Veil",
  3181: "Sanguine Blade",
  3184: "Entropy",
  3185: "The Lightbringer",
  3186: "Kitae's Bloodrazor",
  3187: "Hextech Sweeper",
  3188: "Blackfire Torch",
  3190: "Locket of the Iron Solari",
  3196: "Augment: Power",
  3197: "Augment: Gravity",
  3198: "Augment: Death",
}
  
# Game status
Handlebars.registerHelper 'lol_games', (context) ->
  result = '';
  
  # Iterate list of games
  for game in this.lolGames
    gameDate = "<time class=\"timeago\" datetime=\"#{game.created}\">#{game.created}</time>"
    gameItems = ( "<li>#{stat.type}:#{items[stat.value]}</li>" for stat in game.statistics when stat.type.match(/ITEM/) )
    result += "<li>#{game.type} #{champions[game.championId]} #{gameDate}"
    result += "<ul>#{gameItems.join('')}</ul>"
 
  return new Handlebars.SafeString result
  
# Player stats
Handlebars.registerHelper 'lol_stats', (context) ->
  result = ''

  # Iterate list of stats
  for stat in this.lolStats
    result += "<li>#{stat.summaryType} : #{stat.rating} (#{stat.wins}/#{stat.losses})</li>"
  return new Handlebars.SafeString result  

# Champion lookup
Handlebars.registerHelper 'champion', (context, options) ->
  champions[context]
