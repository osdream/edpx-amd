/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * 
 **************************************************************************/
 
 
/*
 * path:    lib/file.js
 * desc:    
 * author:  songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/04/21 17:22:02$
 */

var fs = require('fs');
var path = require( 'path' );
var edp = require('edp-core');
var amd = edp.amd;
var Deferred = edp.Deferred;
var logger = edp.log;

/**
 * 转换成数组：
 * - 如果本身是数组，直接返回；
 * - 如果是其他，返回以其为唯一元素的数组
 *
 * @param {*} mixed 输入的参数
 */
function toArray(mixed) {
    if (Object.prototype.toString.call(mixed) == '[object Array]') {
        return mixed;
    }
    else {
        return [mixed];
    }
}

/**
 * 如果存在匿名模块，那么需要根据配置文件生成模块ID
 *
 * @param {Array.<Object>} modules 模块数组
 * @param {string} file 模块所处文件
 * @param {string} configFile 模块配置文件路径
 */
function fixModuleId(modules, file, configFile) {
    var fixed = [];
    modules.forEach(function(module, i) {
        if (!module.id && configFile) {
            var ids = amd.getModuleId(path.resolve(file), configFile);
            // 这种情况应该是属于非法的匿名模块，直接忽略
            if (!ids.length) {
                return;
            }
            module.id = ids[ids.length - 1];
            module.aliasIds = ids.slice(0, ids.length - 1);
        }
        fixed.push(module);
    });

    return fixed;
}

/**
 * 将参数解析成模块ID：有些参数可能是文件
 *
 * @param {Array.<string>} args 参数列表
 * @param {string} configFile 模块配置文件路径
 * @return {Array.<string>}
 */
function parseModuleIds(args, configFile) {
    var ids = [];
    args.forEach(function(arg) {
        if (/\.js$/.test(arg)) {
            var code = fs.readFileSync(arg, 'utf-8');
            var ast = amd.getAst(code);
            if (ast) {
                var mods = amd.analyseModule(ast);
                mods = fixModuleId(toArray(mods), arg, configFile);
                mods.forEach(function(mod) {
                    ids.push(mod.id);
                });
            }
        }
        else {
            ids.push(arg);
        }
    });

    return ids;
}



/**
 * 列出 JS 文件中的模块
 * @param {Array.<string>} files 文件数组
 * @param {string} configFile 模块配置文件路径
 */
function listModule(files, configFile) {
    var util = edp.util;
    if (!fs.existsSync(configFile)) {
        logger.warn('module.conf not found: ' + configFile);
        configFile = null;
    }

    var realFiles = [];
    var promises = [];
    function processFile(file) {
        var deferred = new Deferred();
        fs.readFile(file, 'utf-8', function(err, code) {
            if (err) {
                deferred.reject(err);
                return false;
            }
            var ast = amd.getAst(code);
            if (ast) {
                var modules = amd.analyseModule(ast);
                if (!modules) {
                    logger.warn('no module in: ' + file);
                    deferred.resolve(null);
                }
                else {
                    deferred.resolve(modules);
                }
            }
            else {
                deferred.resolve(null);
            }
        });
        realFiles.push(file);
        promises.push(deferred.promise);
    }

    files.forEach(function(file) {
        var stat = fs.statSync(file);
        if (stat.isDirectory()) {
            util.scanDir(file, function(subFile) {
                if (!/\.js$/.test(subFile)) {
                    return;
                }
                processFile(subFile);
            });
        }
        else if (stat.isFile()) {
            processFile(file);
        }
    });

    return Deferred.all.apply(Deferred, promises)
        .then(function() {
            var results = [].slice.call(arguments);
            var found = [];
            realFiles.forEach(function(file, i) {
                var modules = results[i];
                if (!modules) {
                    return;
                }
                found.push({
                    file: file,
                    modules: fixModuleId(toArray(modules), file, configFile)
                });
            });
            return found;
        });
}

/**
 * 搜索某个目录下所有文件及其包含的模块信息
 *
 * @param {string} configFile 模块配置文件路径
 * @param {string} dir 搜索目录
 * @return {Object.<string, Array>}
 */
function searchModules(configFile, dir) {
    var util = edp.util;
    var fileModuleMap = {};

    function scanDir(dir) {
        if (!fs.existsSync(dir)) {
            log.error('No such file or directory: %s', dir);
        }
        else {
            util.scanDir(dir, function(file){
                if (!/\.js$/.test(file)) {
                    return;
                }
                var modules = [];
                var code = fs.readFileSync(file, 'utf-8');
                var ast = amd.getAst(code);
                if (ast) {
                    modules = amd.analyseModule(ast);
                    if (modules) {
                        // 存在匿名模块的情况下，通过文件路径解析出模块ID
                        modules = fixModuleId(
                            toArray(modules),
                            path.resolve(file),
                            configFile
                        );
                    }
                }
                if (modules && modules.length) {
                    fileModuleMap[file] = modules;
                }
            });
        }
    }

    var config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    // 如果指定了搜索目录，使用指定的搜索目录
    // 如果没有就将 module.conf 中配置的 baseUrl 或者 module.conf 所处目录作为搜索目录
    if (!dir) {
        var baseDir = path.resolve(
            path.dirname(configFile),
            config.baseUrl
        );
        var projectDir = path.resolve(path.dirname(configFile));
        if (baseDir.indexOf(projectDir) == 0) {
            dir = projectDir;
        }
        else {
            dir = baseDir;
        }
    }

    scanDir(dir);

    // 还需要搜索 dep 目录这些可能在 baseUrl 之外的目录
    var projectDir = path.dirname(configFile);
    if (config && config.packages) {
        config.packages.forEach(function(pkg) {
            var location = path.join(config.baseUrl, pkg.location);
            if (/\.\.\//.test(location)) {
                scanDir(path.resolve(projectDir, location));
            }
        });
    }

    return fileModuleMap;
}

/**
 * 寻找包含指定模块ID的所有JS文件
 *
 * @param {Array.<string>} modules 要寻找的模块ID的数组
 * @param {string} searchDir 搜索目录
 * @param {string} configFile 模块配置文件 module.conf 的路径
 * @return {Array.<Object>}
 */
function findModule(modules, searchDir, configFile) {
    if (!fs.existsSync(configFile)) {
        logger.error('module.conf not found: ' + configFile);
        return [];
    }
    var map = {};
    modules.forEach(function(module) {
        map[module] = [];
    });
    var fileModuleMap = searchModules(configFile, searchDir);
    for (var file in fileModuleMap) {
        var fileModules = fileModuleMap[file];
        var moduleIds = [];
        fileModules.forEach(function(module) {
            moduleIds.push(module.id);
            if (module.aliasIds) {
                moduleIds = moduleIds.concat(module.aliasIds);
            }
        });
        modules.forEach(function(module) {
            if (moduleIds.indexOf(module) != -1) {
                map[module].push(file);
            }
        });
    }
    var results = [];
    modules.forEach(function(module) {
        results.push({
            module: module,
            files: map[module]
        });
    });
    return results;
}

/**
 * 将ID转换为相对ID
 * @param {string} id 模块 ID
 * @param {Object} moduleConfig 模块配置
 * @param {string} baseUrl 模块 baseUrl (绝对路径)
 * @param {string} absFileDir 当前文件所处目录的绝对路径
 * @param {boolean} resolveAll 是否处理 package 和 paths
 * @return {string}
 */
function resolveToRelativeId(id, moduleConfig, baseUrl, absFileDir, resolveAll) {
    function makeRelative(fileDir, realPath, isPackageOrPaths) {
        var id = path.relative(absFileDir, realPath);
        if (isPackageOrPaths) {
            return id;
        }
        if (!/^\./.test(id)) {
            return './' + id;
        }
        else {
            return id;
        }
    }

    function resolve(id) {
        // 尝试以package处理
        var packages = moduleConfig.packages || [];
        for (var i = 0; i < packages.length; i++) {
            var pkg = packages[i];
            var pkgName = pkg.name;
            var pkgLoc = pkg.location;
            var absPkgLoc = path.resolve(baseUrl, pkgLoc);
            // 是以package开头的
            if ((new RegExp('^' + pkgName + '(/|$)')).test(id)) {
                if (!edp.path.isRelativePath(pkgLoc)) {
                    return id;
                }
                // 如果不需要对 module.conf 里配置的 package 和 paths 转换为相对路径，那么直接返回
                if (!resolveAll) {
                    return id;
                }
                var pkgMain = pkg.main || 'main';
                if (id === pkgName) {
                    var realPath = absPkgLoc + '/' + pkgMain;
                    return path.relative(absFileDir, realPath);
                }
                else {
                    var realPath = absPkgLoc + id.replace(pkgName, '');
                    return path.relative(absFileDir, realPath);
                }
            }
        }

        // 尝试以paths配置处理
        var paths = moduleConfig.paths || {};
        var pathKeys = Object.keys(paths).slice(0);
        pathKeys.sort(function (a, b) {
            return paths[b].length - paths[a].length;
        });
        for (var i = 0; i < pathKeys.length; i++) {
            var key = pathKeys[i];
            var modulePath = paths[key];
            var absModulePath = path.resolve(baseUrl, modulePath);
            // 是以paths里某项开头的模块
            if ((new RegExp('^' + key + '(/|$)')).test(id)) {
                if (!edp.path.isRelativePath(modulePath)) {
                    return id;
                }
                // 如果不需要对 module.conf 里配置的 package 和 paths 转换为相对路径，那么直接返回
                if (!resolveAll) {
                    return id;
                }
                var realPath = id.replace(key, absModulePath);
                return path.relative(absFileDir, realPath);
            }
        }

        // 剩下的要么以baseUrl作为顶层目录的，要么本身就是相对路径
        // 本身是相对路径的case，例如: '../modA', './modB'
        if (/^\./.test(id)) {
            return id;
        }
        // 以baseUrl作为根目录的case，例如: 'dirA/modA'
        else {
            // 先以baseUrl计算得到模块的绝对路径，然后再相对当前文件计算相对路径
            var relativeId = path.relative(absFileDir, path.resolve(baseUrl, id));
            return /^\./.test(relativeId) ? relativeId : './' + relativeId;
        }
    }

    // 如果ID本身就是绝对路径，就不需要解析了
    if (!edp.path.isRelativePath(id)) {
        return id;
    }

    // 正常模块ID
    if (!/!/.test(id)) {
        return resolve(id);
    }
    // 插件ID
    else {
        var parts = id.split('!');
        var pluginId = parts[0];
        var resourceId = parts[1];
        return resolve(pluginId) + '!' + resolve(resourceId);
    }
}

/**
 * 将 top-level 的模块 ID 转换为相对 ID
 * @param {string} filePath 要处理的文件的路径
 * @param {string} configFile 模块配置文件路径(module.conf)
 * @param {Object} options 选项
 * @config {boolean=} resolveAll 是否处理package和paths
 * @config {string} outputType 输出类型：overwrite/copy/console/return
 */
function relatify(filePath, configFile, options) {
    var resolveAll = options.resolveAll === true;
    var outputType = options.outputType || 'overwrite';
    var moduleConfig = JSON.parse(fs.readFileSync(configFile));

    // 转化为绝对路径，去除文件后缀
    var absFileDir = path.dirname(path.resolve(filePath));

    // 计算baseUrl的绝对路径
    var baseUrl = path.resolve(
        path.dirname(configFile),
        moduleConfig.baseUrl
    );

    var code = fs.readFileSync(filePath, 'utf-8');
    // 处理 define：define("alpha", ["beta", "theta"], function() {});
    code = code.replace(
            /(define\s*\(\s*((['"])[^'"]+\3)?)([^(]+)(function\s*\()/g,
            function($0, $1, $2, $3, $4, $5) {
                var replaced = $4.replace(
                    /(['"])([^'"]+)\1/g,
                    function($0, $1, $2) {
                        return $1 + resolveToRelativeId($2, moduleConfig, baseUrl, absFileDir, resolveAll) + $1;
                    }
                );
                return $1 + replaced + $5;
            }
        )
        // 处理 require：require("alpha");
        .replace(
            /(require\s*\(\s*)(['"])([^'"]+)\2(\s*\))/g,
            function($0, $1, $2, $3, $4) {
                return $1 + $2 + resolveToRelativeId($3, moduleConfig, baseUrl, absFileDir, resolveAll) + $2 + $4;
            }
        );

    // 输出方式：直接改写
    if (outputType === 'overwrite') {
        fs.writeFileSync(filePath, code, 'utf-8');
    }
    // 输出方式：在同目录下新建一个*.relative.js的文件
    else if (outputType === 'copy') {
        fs.writeFileSync(filePath.replace(/\.js$/, '.relative.js'), code, 'utf-8');
    }
    // 输出方式：输出到console
    else if (outputType === 'console') {
        console.log(code);
    }
    else if (outputType === 'return') {
        return code;
    }
}

exports.parseModuleIds = parseModuleIds;
exports.searchModules = searchModules;
exports.listModule = listModule;
exports.findModule = findModule;
exports.relatify = relatify;
















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
