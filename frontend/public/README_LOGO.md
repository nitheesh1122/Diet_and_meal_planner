# Logo Placement Instructions

## Where to Place Your Logo Files

Place your logo image files in this folder: `frontend/public/`

### Recommended File Names:
1. **`logo.png`** or **`logo.svg`** - Full logo with text (for expanded sidebar)
2. **`logo-icon.png`** or **`logo-icon.svg`** - Icon only version (for collapsed sidebar)
3. **`favicon.ico`** - Browser tab icon (16x16 or 32x32 pixels)

### File Formats:
- **PNG**: Best for logos with transparency
- **SVG**: Best for scalable vector logos (recommended)
- **ICO**: Required for favicon

### Recommended Sizes:
- **Full logo**: 200-300px width (or SVG for scalability)
- **Icon logo**: 64x64px or 128x128px (or SVG)
- **Favicon**: 16x16, 32x32, or 48x48px

## After Placing Your Logo:

1. **Update Logo.jsx** if your file names are different:
   - Change `logo-icon.png` to your icon filename
   - Change `logo.png` to your full logo filename

2. **Update favicon** in `index.html`:
   ```html
   <link rel="icon" type="image/x-icon" href="/favicon.ico" />
   ```

3. **Test the logo**:
   - Check collapsed sidebar (icon only)
   - Check expanded sidebar (full logo)
   - Check browser tab (favicon)

## Example File Structure:
```
frontend/public/
  ├── logo.png          (Full logo)
  ├── logo-icon.png     (Icon only)
  └── favicon.ico       (Browser tab icon)
```

## Notes:
- Files in `public/` folder are served from the root URL (`/logo.png`)
- Use SVG format for best quality at all sizes
- Ensure logos have transparent backgrounds if needed
- Test logos on both light and dark backgrounds if you have dark mode

