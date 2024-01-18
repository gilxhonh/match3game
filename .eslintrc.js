/** @type {import('eslint').Linter.Config} **/
const options = {
	root: true,
	extends: ["@gdk/eslint-config/recommended"],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ["./tsconfig.json"],
		createDefaultProgram: true,
	},
	ignorePatterns: ["build", "assets", "**/*.min.js"],
	rules: {
		// buggy rule: some false positives
		"unicorn/consistent-function-scoping": "off",
		// rule are too restrictive
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-unsafe-member-access": "off",
		"@typescript-eslint/no-unsafe-call": "off",
	},
};

module.exports = options;
