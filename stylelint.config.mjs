export default {
  extends: ['stylelint-config-standard-scss'], // configures rules for CSS and SCSS
  plugins: ['stylelint-scss'], // Enable SCSS-specific rules
  overrides: [
    {
      files: ['**/*.scss'],
      customSyntax: 'postcss-scss', // Use SCSS parser
    },
  ],
  rules: {
    'color-no-invalid-hex': true, // Shared rule for CSS and SCSS
    'scss/at-rule-no-unknown': true, // SCSS-specific rule
  },
};
