const path = require('path');
const wunderbar = require('@gribnoysup/wunderbar');
const readline = require('readline');
module.exports = {
    apply(compiler) {
        const map = new Map();
        const activeLoaders = {}
        const activeExtensions = {};
        compiler.plugin('compilation', compilation => {
            compilation.plugin('build-module', module => {
                const { resource, request } = module;
                const loaders = (module.loaders || []).map(l => l.loader);
                map.set(request, {
                    resource,
                    loaders
                });
                if (!resource) {
                    return;
                }
                const extension = path.extname(resource);
                loaders.forEach(loader => {
                    if (!activeLoaders[loader]) {
                        activeLoaders[loader] = 0;
                    } 
                    activeLoaders[loader] += 1;
                })
                if (!activeExtensions[extension]) {
                    activeExtensions[extension] = 0;
                }
                activeExtensions[extension] += 1;
                pp(activeExtensions, activeLoaders);
            })
            compilation.plugin('succeed-module', module => {
                const {resource, loaders} = map.get(module.request);
                if (!resource) {
                    return;
                }
                const extension = path.extname(resource);
                loaders.forEach(loader => {activeLoaders[loader] -= 1;})
                activeExtensions[extension] -= 1;
                pp(activeExtensions, activeLoaders);
            });
        });
    }
}
let throttled = false;
let last = [];
function pp(extensions, loaders) {
    last = [extensions, loaders];
    if (throttled) {
        return;
    }
    setTimeout(() => {
        throttled = false;
        clearScreen();
        const [extensions, loaders] = last;
        print(extensionsToGraphData(extensions));
        print(loadersToGraphData(loaders));
    }, 100);
    throttled = true;
    clearScreen();
    print(extensionsToGraphData(extensions));
    print(loadersToGraphData(loaders));
}
function clearScreen() {
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
}
function print(data) {
    const { chart, legend, scale, __raw } = wunderbar(data, {
        min: 0,
        length: 42,
    });
    
    console.log();
    console.log(chart);
    console.log();
    console.log(scale);
    console.log(legend);
}

const extensionColors = {
    '.js': '#FF9900',
    '.pug': '#FF6666',
    '.scss': '#FF00FF'
}
const loaderColors = {

}
function extensionsToGraphData(extensions) {
        return Object.entries(extensions).filter(([label, value]) => value).map(([label, value]) => {
        if (!extensionColors[label]) {
            extensionColors[label] = '#'+Math.floor(Math.random()*16777215).toString(16);
        }

        return {
            label: label.slice(1),
            value,
            color: extensionColors[label]
        }
    });
}


function loadersToGraphData(loaders) {
    return Object.entries(loaders).filter(([label, value]) => value).map(([label, value]) => {
        if (!loaderColors[label]) {
            loaderColors[label] = '#'+Math.floor(Math.random()*16777215).toString(16);
        }

        return {
            label: label.slice(1),
            value,
            color: loaderColors[label]
        }
    })
}