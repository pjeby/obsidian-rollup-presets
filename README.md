# Rollup presets for building Obsidian plugins

> This project has been discontinued, as I am now using [Ophidian](https://github.com/pjeby/ophidian) to build my plugins.  Its build system has about the same features as this and a similar API, but is much faster and needs fewer dependencies in the plugin's package.json.

### Old Instructions

This is just a way to minimize duplication in rollup.config.js across my various Obsidian plugin projects.

You probably don't need or want it, but if you do, you should probably depend on a specific commit (e.g. `yarn add "pjeby/obsidian-rollup-presets#424242" -D`), because backward compatibility may not be maintained.

Here's a sample rollup config using this:

```js
import builder from "obsidian-rollup-presets";
export default builder().withInstall(__dirname).build():
```

This will build a `styles.css` from any imported `.css` or `.scss` files, using `plugin.js` as the main entry point to roll up an output of `main.js`.  (URLS

The  `withInstall(__dirname)` operation says, "if an `OBSIDIAN_TEST_VAULT` env variable is set, copy the built plugin to a hot-reload-capable installation directory (`$OBSIDIAN_TEST_VAULT/.obsidian/plugins/$(basename __dirname)`)".  If the `OBSIDIAN_TEST_VAULT` isn't set, no extra action is taken.  (A `.hotreload` file will also be created, unless the second argument to `withInstall()` is false.)

If you want to change the configuration in some way, `builder()` accepts a function that will be passed the configuration object, allowing it to be altered.  You can also call `.assign(object)` on the builder to set specific properties, or `.withPlugins(plugin,...)` to add more rollup plugins, or `.apply(func)` to call func with the configuration object.

(So, if you'd rather, say, use `src/index.js` as the main entry point, you can just `.assign({input: "src/index.js"})` in the setup chain.)

Mostly, though, what this package does is wrap the various node modules needed to do the building, so that my plugins only need this in their `devDependencies`.

### Dependencies

If a plugin project is pure Javascript, you should only need this and rollup in your package.json `devDependencies` to be able to build.   If you also need TypeScript, SCSS processing, or use modules that contain CSS, you may need some additional dependencies.

These depedencies are defined as peer dependencies, so if you are installing with npm 7 or higher, they will be installed automatically; if you're using an older version of npm, or you're using yarn, you'll need to add them to package.json yourself (with `npm i -D` or `yarn add ... --dev`):

#### TypeScript

Add `typescript` and `@rollup/plugin-typescript` to your package's `devDependencies`, and `.withTypeScript()` to your `rollup.config.js`.  (You can pass in an options object, which will be passed along to @rollup/plugin-typescript.)

#### SCSS and CSS

Add `node-sass` to your package's `devDependencies`.