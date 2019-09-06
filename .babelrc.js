module.exports = function(api) {
  const presets = ["razzle/babel"];
  const plugins = [];
  if (api.env("production")) {
    plugins.push(["babel-plugin-jsx-remove-data-test-id", {"attributes": ["data-cy"]}]);
  }
  return {presets, plugins};
}