// Proxy module to point to the TSX implementation so bundlers don't parse JSX in this .ts file.
export { default, useLanguage, LanguageProvider } from './useLanguage.tsx';