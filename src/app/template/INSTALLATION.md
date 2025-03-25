# Installation Instructions for PDF Generation

To enable PDF generation functionality in this application, you need to install the `@react-pdf/renderer` package:

```bash
npm install @react-pdf/renderer
# or
yarn add @react-pdf/renderer
```

After installation, restart your development server for the changes to take effect.

## Important Notes

1. The PDF generation happens client-side, which might cause performance issues with very large tables
2. The PDF library has some limitations when rendering complex tables
3. For months with many days, you might need to adjust the column widths in the PDF 
4. This implementation uses A4 Landscape orientation to fit more columns
5. This implementation assumes that your project is compatible with React 16.8+ (for hooks support)

## Common Issues

If the table is not rendering in the PDF, it could be due to:

1. The table being too wide for the page
2. Too many columns causing layout issues
3. Next.js SSR/SSG conflicts with PDF generation

If you encounter issues, try:

1. Simplifying the table layout
2. Using a fixed width for columns
3. Using the `@react-pdf/renderer` directly with `pdf().toBlob()` method instead of PDFDownloadLink
