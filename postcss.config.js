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
      content: ["./build/index.html"],
      defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
    }),
    require("cssnano")({
      preset: "default",
    }),
  ],
}
