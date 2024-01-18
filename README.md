# Boilerplate ITG game (FDJ)

## Usage

### Build

`npm run build` or `npm run watch`

### Launch the game

`npm start` will launch the platform emulation and serve the game locally.

If the repository contains several games, you wil be prompt to choose the one you want to run.

you can specify the game to run and/or the port to run on : `npm start -- boilerplateitg -p 1338`

While the server is launched, you can access a swagger API documentation [here](http://127.0.0.1:1337/documentation), please take care to set the port to the game one, and use for exemple the ITG mock routes to simulate specific tickets.

### Git

First commit must be the boilerplate untoutched.

To commit, it is recommended to use the command:

```bash
npm run commit
```

Please take some time to read/reread our [git rules](https://doc.gdk.fdj-gs.com/documentation/get-started/gdk-300/302-git.html).

## Project structure

Applet project can be used to make several game at once

To add a new game to the project, just add an entry to the games object in the package.json file.

```json
"games": {
    "default": "default.conf.ts"
 },
```

The value must be the path to the game configuration file.

### Game configuration

- A specific json configuration file for your game that will hold any game-specific config.

# Production parameters

`masterGameCode` is the reference game name, for example astro is the masterGameCode, for the astro games and FDJ has astro2020 and DS has dsastrospiel it's used to get the games files.

`gameProvider` is the lottery code of the game creator.

`gameDescription.numberOfStakes` this object describes the minimum stakes required by the game, and the maximum supported. A lottery can for example decide if a game with min 1 and max 3 will have 1, 2 or 3 stakes for them.

`gameDescription.isJackpot` this value describe if the game is a jackpot fir other games.

`gameDescription.isConversion` this value describe if the gain of the game will be converted from the bet currency to an other currency.

`gameDescription.jackpotCompatible` this value describe if the game support a jackpot activation.

`gameDescription.demoCompatible` this value describe if the game support a demo play.

`gameDescription.replayCompatiple` this value describe if the game handle replay for a played ticket.

`gameDescription.supportedBetModes` is an array of the game supported bet modes, correct ones are : BET_AUTO_CLAIM (bet&claim at once, preferred mode for FDJ) or BET_MANUAL_CLAIM (bet then claim, preferred mode for other lotteries).

`gameDescription.assets` section list what is available to this game applet (themes, languages, services). In the `services` part, key must be the croupier serviceName, while value is the path to the croupier file (needed to test the game locally).

`gameParameters` free zone that you can use as you wish.

`behavioursParameters` parameters dedicated for behaviours configuration.

`defaultStakeIndex` is the default selected stake in the game.

# Local Parameters (Overridden by IF in production)

`lotteryCode` is the code of the lottery using the game.

`lotteryGameCode` is the code used to bet on the gale for example in ASTRO for FDJ it will be astro2020 and for DS dsastrospiel, it must be one of `gameDescription.assets.services` to be able to perform a bet).

`lotteryGameLabel` is a label used by the lottery to name the game.

`lotteryGameDescription` is a text used by the lottery to describe the game.

`stakes` list of stakes available to the applet to bet. It includes value, currency.

`jackpot` describe the jackpot activation.

`demo`describe how the game handle demo.

`selectedBetMode` is the game active bet mode, it must be one of `gameDescription.assets.supportedBetModes`.

`selectedTheme` is the game theme used, must be one of `gameDescription.assets.themes`.

`selectedLocale` is the game locale.

`selectedBehaviour` is the game vi used, must be one of `gameDescription.asstes.behaviours`.

Those two config files will be merged into one at run time, and are watched while server is running.

### Code

Every game must be multi-lottery ready.

- No hard coded amounts, every displayed amounts MUST be the stake multiplied by a value (use the multiply method on Amount class).
- Call `updateBet` and `claim` even if your game is in AUTO_CLAIM mode. A `claim` call will automatically update the displayed purse
- Implement an auto mode on the reveal (in replay mode there will be no user action).

### Assets

The assets folder contains all games assets. It contains the list of all game themes (one by sub-folders).
There is also all generic text for all theme in i18next files (example : en-US.json).

Each game folders have the same structure :

- `editor` all the editor skin parts, we will detail that after
- `animations` &ll the spine animations
- `fonts` the theme fonts, use ttf by preference
- `images` all images and sprite sheets at the json format
- `locales` all i18next specifics for the theme
- `files.json` all files loaded by the editor project and the game
- `project.gdk` the theme editor project
- `project.json` the json result of the editor project, this file is used by the game to load the theme

### Editor project

The editor project is set in the file `project.gdk`.
All assets are dispatched in the directory corresponding their type.
The file `project.json` is the result file.
Anyway in the `editor` directory there are all partial json used by the `project.gdk`.

In this directory :

- `skin` contains all skin section of the game skin :
  - `rules.skin` the rules view skin
  - `result.skin` the result view skin
  - `root.skin` the global skin
  - `superjackpot.skin` the superjackpot component skin
- `views` contains all view construction (one file by view)
- `.editor.json` contain all the editor settings for this project

### Croupier

In order to test the game locally, the croupier file must be referenced in the config (see in the Game configuration section).

### Delivery & CI

This game has all configuration files mandatory for the [gitlab delivery system](https://doc.gdk.fdj-gs.com/documentation/get-started/gdk-300/304-delivering-the-game.html). Please read/reread the documentation to ensure your future deliveries.

### More information

All the documentation is available [here](https://doc.gdk.fdj-gs.com/)
