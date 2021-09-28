module.exports = {
  images: {
    domains: ['m.media-amazon.com', 'resizing.flixster.com'],
  },
  webpack: (config) => {
    config.module.rules.push(
      {
        test: /\.svg$/,
        exclude: [
          /algolia\.svg$/
        ],
        use: ['@svgr/webpack'],
      },
      {
        test: /algolia\.svg$/,
        use: ['svg-url-loader'],
      }
    );

    return config;
  }
};