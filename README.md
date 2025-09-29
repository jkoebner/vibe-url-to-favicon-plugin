# Tab Favicon Labeler

A Firefox extension that replaces tab favicons with custom colorful labels based on URL patterns.

*Built with assistance from AI*

## Features

- **Custom Labels**: Create 6-character labels displayed as two lines (3 characters each)
- **Color Customization**: Set both foreground and background colors for each label
- **URL Pattern Matching**: Use regular expressions to match specific URLs
- **Import/Export**: Backup and share your configuration
- **Real-time Updates**: Changes apply immediately to matching tabs
- **Modern UI**: Clean, responsive interface with smooth animations

## Installation

1. Clone this repository
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file

## Usage

1. Click the extension icon and select "Open Configuration"
2. Add rules with:
   - **Label**: Up to 6 characters (e.g., "STAGE" or "PROD")
   - **Colors**: Choose background and text colors
   - **URL Pattern**: Regular expression to match URLs
   - **Description**: Optional description for the rule

### Example Configuration

- **Label**: `STAGE`
- **Pattern**: `https?://stage\.application\.com/.*`
- **Description**: "Staging Environment"

This will show "STG" on the first line and "E" on the second line as a colored favicon for any tabs matching `stage.application.com`.

## Configuration

The extension comes with two example rules pre-configured:
- Staging environment (`stage.application.com`)
- Production environment (`prod.application.com`)

You can modify, disable, or delete these rules as needed.

## Import/Export

- **Export**: Save your configuration as a JSON file
- **Import**: Load configuration from a JSON file
- Useful for backing up settings or sharing configurations

## Keyboard Shortcuts

- **Ctrl+S** (Cmd+S on Mac): Save all rules
- **Escape**: Close modal dialogs

## Development

### File Structure

```
├── manifest.json           # Extension manifest
├── background.js          # Background script
├── content.js            # Content script for favicon replacement
├── options.html          # Configuration page
├── options.js            # Configuration page logic
├── popup.html            # Extension popup
├── popup.js              # Popup logic
├── styles/
│   ├── options.css       # Configuration page styles
│   └── popup.css         # Popup styles
├── icons/                # Extension icons (optional)
└── README.md             # This file
```

### Technical Details

- Uses HTML5 Canvas to generate favicon images with gradients
- Supports custom foreground and background colors
- Monitors URL changes for single-page applications
- Stores configuration in browser's local storage
- Real-time preview of favicon appearance
- Responsive design with mobile support

### Browser Support

- Firefox (Manifest V2)
- Compatible with both `browser` and `chrome` APIs for cross-browser potential

## Configuration Format

The extension stores rules in the following JSON format:

```json
{
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "rules": [
    {
      "enabled": true,
      "label": "STAGE",
      "backgroundColor": "#667eea",
      "foregroundColor": "#ffffff",
      "pattern": "https?://stage\\.application\\.com/.*",
      "description": "Staging Environment"
    }
  ]
}
```

## Troubleshooting

### Common Issues

1. **Extension not working**: Ensure you've granted the necessary permissions
2. **Favicon not updating**: Try refreshing the page or restarting the browser
3. **Pattern not matching**: Test your regular expression pattern
4. **Import fails**: Verify your JSON file format

### Debug Mode

Check the browser console for error messages:
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for messages prefixed with "Content:", "Background:", or "Options:"

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
 
## Author 

**Joel Köbner, eggs unimedia GmbH**
**GitHub:** @jkoebner
**E-Mail:** jkoebner@eggs.de 
**Repository:** github.com/jkoebner/vibe-url-to-favicon-plugin