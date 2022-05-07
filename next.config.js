module.exports = {
  images: {
    domains: ['image.tmdb.org', 'm.media-amazon.com'],
  },
  webpack: (config) => {
    config.module.rules.push(
      {
        test: /\.svg$/,
        exclude: [/algolia\.svg$/],
        use: ['@svgr/webpack']
      },
      {
        test: /algolia\.svg$/,
        use: ['svg-url-loader']
      }
    );

    return config;
  }
};