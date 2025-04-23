// countries.ts
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

// register English names
countries.registerLocale(enLocale);

// build and export your array of { code, name }
export const COUNTRIES: { code: string; name: string }[] = 
  Object.entries(countries.getNames('en', { select: 'official' }))
    .map(([code, name]) => ({ code, name }))
    // optional: sort alphabetically by name
    .sort((a, b) => a.name.localeCompare(b.name));
