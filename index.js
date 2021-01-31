const {nodeResolve} = require('@rollup/plugin-node-resolve');
const commonjs      = require('@rollup/plugin-commonjs');
const postcss       = require('rollup-plugin-postcss');
const url           = require("postcss-url");
const {basename}    = require("path");
const fs            = require("fs-extra");
const copyNewer     = require('copy-newer');

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

    withInstall(pluginName, hotreload=true) {
        if (process.env.OBSIDIAN_TEST_VAULT) {
            const pluginDir = process.env.OBSIDIAN_TEST_VAULT + "/.obsidian/plugins/" +  basename(pluginName);
            return this.withPlugins(pluginInstaller(pluginDir, hotreload));
        }
        return this;
    }

    build() {
         return this.cfg;
    }
}

function pluginInstaller(pluginDir, hotreload) {
    return {
        name: "plugin-installer",
        async generateBundle({file, dir}) {
            await copyNewer("{main.js,styles.css,manifest.json}", pluginDir, {verbose: true});
            if (hotreload) await fs.ensureFile(pluginDir+"/.hotreload");
        }
    }
}