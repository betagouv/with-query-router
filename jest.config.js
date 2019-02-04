module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  'testURL': 'http://localhost',
  transformIgnorePatterns: ['<rootDir>/node_modules/', '[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs)$'],
  // "transform": {
  //   "^.+\\.js$": "babel-jest",
  // }
  transform: {
    "^.+\\.(js|jsx|mjs)$": "<rootDir>/jest-transformer.js"
  },
  verbose: true
}
