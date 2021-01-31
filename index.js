const {nodeResolve} = require('@rollup/plugin-node-resolve');
const commonjs      = require('@rollup/plugin-commonjs');
const postcss       = require('rollup-plugin-postcss');
const url           = require("postcss-url");
const {basename}    = require("path");

module.exports = function builder() { return new Builder(); }

class Builder {
    constructor(f) {
        this.cfg = {
            input: 'plugin.js',
            output: {
                file: 'main.js',
                format: 'cjs',
                exports: 'default'
            },
            external: ['obsidian'],
            plugins: [
                nodeResolve({browser: true}),
                postcss({extract: "styles.css", plugins: [url({url: "inline"})]}),
                commonjs(),
            ]
        }
        if (f) this.apply(f)
    }

    apply(f) {
        f(this.cfg); return this;
    }

    assign(props) {
        return this.apply( c => Object.assign(c, props) );
    }

    withPlugins(...plugins) {
        return this.apply(c => c.plugins.push(...plugins));
    }

    withReload(pluginName) {
        if (process.env.OBSIDIAN_TEST_VAULT) {
            const pluginDir = process.env.OBSIDIAN_TEST_VAULT + "/.obsidian/plugins/" +  basename(pluginName);
            return this.withPlugins(require('rollup-plugin-copy')({
                verbose: true,
                targets: [
                    {src: "manifest.json", dest: pluginDir, copyOnce: true},
                    {src: "manifest.json", dest: pluginDir, copyOnce: true, rename: ".hotreload", transform: () => ""},
                    {src: ["main.js", "styles.css"], dest: pluginDir},
                ]
            }));
        }
        return this;
    }

    build() {
         return this.cfg;
    }
}