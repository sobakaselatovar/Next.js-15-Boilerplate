// Change your rules accordingly to your coding style preferencies.
// https://prettier.io/docs/en/options.html

module.exports = {
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'auto',
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: [
    '^next/(.*)$', // Импорты из Next.js
    '^react/(.*)$', // Импорты из React
    '^@mantine/(.*)$', // Импорты из Mantine
    '^[^@].*$', // Другие пакеты (не начинающиеся с @)
    '^@/(.*)$', // Импорты из @
    '^\\.\\./', // Импорты из родительских директорий
    '^\\./', // Локальные импорты
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
