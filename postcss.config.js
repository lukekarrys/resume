const PROD = process.env.NODE_ENV === "production"

module.exports = {
  plugins: [
    require("postcss-import"),
    require("postcss-flexbugs-fixes"),
    require("tailwindcss"),
    require("autoprefixer"),
    require("postcss-preset-env")({
      autoprefixer: {
        flexbox: "no-2009",
      },
      stage: 3,
    }),
    require("@fullhuman/postcss-purgecss")({
      content: ["./build/**/*.html"],
      defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
    }),
    PROD &&
      require("cssnano")({
        preset: "default",
      }),
  ].filter(Boolean),
}
