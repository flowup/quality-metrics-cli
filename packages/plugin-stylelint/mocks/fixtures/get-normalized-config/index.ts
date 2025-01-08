
export default {
  rules: {
    'no-descending-specificity': [true, { severity: 'error' }],
    'block-no-empty': [true, { severity: 'error' }],
    'color-no-invalid-hex': [true, { severity: 'error' }],
    'no-invalid-double-slash-comments': [true, { severity: 'error' }],
  },
} as const;
