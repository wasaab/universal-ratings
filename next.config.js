module.exports = {
    images: {
      domains: ['m.media-amazon.com', 'resizing.flixster.com'],
    },
    webpack: (config) => {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      });
  
      return config
    },
  }