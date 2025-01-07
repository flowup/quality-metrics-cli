module.exports = {
  extends: [
    "stylelint-config-standard", // Optional: Base configuration
    "stylelint-config-standard-scss", // Optional: SCSS-specific rules
  ],
  plugins: ["stylelint-scss"], // Include the SCSS plugin
  customSyntax: "postcss-scss", // Use the SCSS parser
  rules: {
    // Add your custom rules here
    "at-rule-no-unknown": null, // Disable the core rule for unknown at-rules
    "scss/at-rule-no-unknown": true, // Enable the SCSS-specific rule
  },
};
