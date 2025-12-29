# 🇦🇹 Twitch Austrian Dialect Translator

A browser extension that automatically translates German text in Twitch chat to Austrian dialect.

## Features

- **Automatic Translation**: Detects German words and phrases in Twitch chat and translates them to Austrian dialect
- **Large Dictionary**: Contains 400+ words and phrases with their Austrian equivalents
- **Preserves Case**: Maintains the original capitalization (e.g., "Hallo" → "Servus")
- **Visual Indicators**: Shows a small 🇦🇹 flag after translated messages
- **Tooltip Support**: Hover over translated text to see the original German
- **Translation Modes**: 
  - Replace mode: Replaces German with Austrian
  - Append mode: Adds the Austrian translation after the original
- **Toggle On/Off**: Easy enable/disable from the popup
- **Test Feature**: Test translations directly in the popup

## Installation

### Chrome / Chromium-based browsers (Brave, Edge, Vivaldi, etc.)

1. Download/extract the extension folder
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `twitch-austrian-translator` folder
6. The extension icon should appear in your toolbar

### Firefox / Zen Browser

1. Download/extract the extension folder
2. Open Firefox and go to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on..."
5. Navigate to the extension folder and select `manifest.json`
6. The extension will be loaded (note: temporary add-ons are removed when Firefox closes)

#### For permanent Firefox installation:
1. Zip all files in the extension folder (not the folder itself)
2. Rename the `.zip` to `.xpi`
3. Go to `about:addons`
4. Click the gear icon and select "Install Add-on From File..."
5. Select the `.xpi` file

## Usage

1. Go to any Twitch channel (e.g., `twitch.tv/your-favorite-streamer`)
2. The extension automatically monitors the chat
3. German messages will be translated to Austrian dialect
4. Look for the 🇦🇹 flag indicator on translated messages
5. Hover over translated text to see the original German

### Settings

Click the extension icon to access settings:

- **Translation enabled**: Toggle the translation on/off
- **Show original**: Show/hide original text in tooltips
- **Translation mode**: Choose between replace or append mode

### Test Translation

Use the test area in the popup to try translations before seeing them in chat:
- Type any German text
- See the instant Austrian translation

## Examples

| German | Austrian |
|--------|----------|
| Hallo | Servus |
| Wie geht's? | Wia gehts? |
| Das ist gut | Des is guat |
| Ich weiß nicht | I woaß ned |
| Keine Ahnung | Ka Ahnung |
| Auf Wiedersehen | Pfiat di |
| Cool/Toll | Leiwand |
| Ich bin müde | I bin miad |
| Kartoffel | Erdöpfi |
| zu Hause | dahoam |
| langweilig | fad |

## Dictionary Coverage

The extension includes translations for:

- **Greetings & Farewells**: hallo, tschüss, auf wiedersehen...
- **Common Words**: nicht, etwas, jetzt, heute...
- **Pronouns**: ich, du, er, sie, wir...
- **Verbs**: sein, haben, können, wollen...
- **Nouns**: Mann, Frau, Kind, Haus...
- **Adjectives**: gut, schön, schnell, alt...
- **Phrases**: "wie geht's", "keine Ahnung", "zum Beispiel"...
- **Twitch/Gaming Terms**: Streamer, Spieler, Zuschauer...

## Technical Details

- **Manifest Version**: V3 (compatible with both Chrome and Firefox)
- **Permissions Required**: 
  - `storage` - for saving settings
  - `*://*.twitch.tv/*` - for running on Twitch
- **Languages**: German → Austrian dialect

## Known Limitations

- Only translates text, not emotes or images
- Some regional dialect variations may not be covered
- Translation is word/phrase-based, not context-aware
- May occasionally miss messages during high chat activity

## Contributing

Feel free to contribute by:
- Adding more words to the dictionary
- Improving translation accuracy
- Reporting bugs or issues
- Suggesting new features

## License

MIT License - feel free to modify and distribute!

---

Made with ❤️ for the Austrian Twitch community!

**Servus und vü Spaß!** 🎮🇦🇹
