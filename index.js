const {nodeResolve}    = require('@rollup/plugin-node-resolve');
const commonjs         = require('@rollup/plugin-commonjs');
const styles           = require('rollup-plugin-styles');
const {basename, join} = require("path");
const fs               = require("fs-extra");
const copyNewer        = require('copy-newer');

module.exports = function builder() { return new Builder(); }

class Builder {
    constructor(f) {
        this.cfg = {
            input: 'plugin.js',
            output: {
                file: 'main.js',
                format: 'cjs',
                assetFileNames: "[name][extname]",
                sourceMap: 'inline',
                exports: 'default'
            },
            external: ['obsidian'],
            plugins: [
                nodeResolve(),
                styles({ mode: ["extract", "styles.css"], url: {inline: true} }),
                commonjs({sourceMap: false}),
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

    withTypeScript(options) {
        return this.apply(c => c.plugins.unshift(require("@rollup/plugin-typescript")(options)));
    }

    withInstall(pluginName, hotreload=true) {
        if (process.env.OBSIDIAN_TEST_VAULT) {
            const pluginDir = join(process.env.OBSIDIAN_TEST_VAULT, ".obsidian/plugins", basename(pluginName));
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
        async writeBundle() {
            await copyNewer("{main.js,styles.css,manifest.json}", pluginDir, {verbose: true});
            if (hotreload) await fs.ensureFile(pluginDir+"/.hotreload");
        }
    }
}