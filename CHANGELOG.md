# Changelog

All notable changes to the Tab Favicon Labeler extension will be documented in this file.

## [1.1.0] - 2024-12-11

### Added
- **Font Options**: Added font size and style selection with 4 options:
  - Large Sans (2 lines × 3 chars) - Default
  - Large Serif (2 lines × 3 chars)
  - Small Sans (3 lines × 4 chars)
  - Small Serif (3 lines × 4 chars)
- **Rule Reordering**: Added drag-and-drop functionality to reorder configuration rules
- **Bottom Add Rule Button**: Added additional "Add Rule" button at the bottom of the rules list
- **Data Persistence**: Form data is now preserved when adding new rules

### Improved
- **Compact Design**: Made both configuration page and popup more space-efficient
  - Reduced font sizes, padding, and margins throughout
  - Popup width reduced from 320px to 280px
  - Tighter spacing while maintaining readability
- **Popup Layout**: Moved configuration button to top next to the on/off toggle
  - Better accessibility and more intuitive layout
  - Properly proportioned button sizes (toggle 33%, label 50%, config button 17%)
- **Label Support**: Increased maximum label length from 6 to 12 characters for small font mode
- **Visual Feedback**: Enhanced drag-and-drop with visual indicators and smooth animations

### Fixed
- **Icon Paths**: Corrected manifest.json icon paths from "icons/icon-*.png" to "icon*.png"
- **Toggle Functionality**: Improved global enable/disable functionality
- **Form Validation**: Better handling of rule data during import/export operations

### Technical
- Enhanced favicon generation with support for different font families (serif/sans-serif)
- Improved canvas rendering for small font sizes with optimized line spacing
- Better error handling and validation for configuration data
- Updated build and packaging scripts

## [1.0.0] - 2024-12-10

### Initial Release
- Custom favicon labels with 6-character support (3 characters per line)
- Color customization for background and foreground
- URL pattern matching using regular expressions
- Import/export functionality for configuration backup
- Real-time updates and preview
- Modern UI with smooth animations
- Firefox extension with Manifest V2 support