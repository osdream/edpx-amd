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
function resolveModuleId(modules, file, configFile) {
    modules.forEach(function(module, i) {
        if (!module.id && configFile) {
            var ids = amd.getModuleId(file, configFile);
            module.id = ids.length == 1 ? ids[0] : ids.join(', ');
        }
    });

    return modules;
}

/**
 * 列出 JS 文件中的模块
 * @param {Array.<string>} files 文件数组
 * @param {string} configFile 模块配置文件路径
 */
function listModule(files, configFile) {
    if (!fs.existsSync(configFile)) {
        logger.warn('module.conf not found: ' + configFile);
        configFile = null;
    }
    var promises = [];
    files.forEach(function(file) {
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
                    deferred.reject('no module in: ' + file);
                }
                else {
                    deferred.resolve(modules);
                }
            }
            else {
                deferred.reject('ast parse error in: ' + file);
            }
        });
        promises.push(deferred.promise);
    });

    return Deferred.all.apply(Deferred, promises)
        .then(function() {
            var results = [].slice.call(arguments);
            var found = [];
            files.forEach(function(file, i) {
                var modules = results[i];
                found.push({
                    file: file,
                    modules: resolveModuleId(toArray(modules), file, configFile)
                });
            });
            return found;
        });
}

/**
 * 搜索某个目录下所有文件及其包含的模块 ID 的映射关系
 *
 * @param {string} configFile 模块配置文件路径
 * @param {string} dir 搜索目录
 * @return {Object.<string, Array>}
 */
function getModuleMap(configFile, dir) {
    var util = edp.util;
    var moduleMap = {};

    function scanDir(dir) {
        if (!fs.existsSync(dir)) {
            log.error('No such file or directory: %s', dir);
        }
        else {
            util.scanDir(dir, function(file){
                if (!/\.js$/.test(file)) {
                    return;
                }
                var moduleIds = [];
                var code = fs.readFileSync(file, 'utf-8');
                var ast = amd.getAst(code);
                if (ast) {
                    var modules = amd.analyseModule(ast);
                    var anonymousModuleExist = false;
                    if (modules) {
                        toArray(modules).forEach(function(module) {
                            if (module.id == null) {
                                anonymousModuleExist = true;
                            }
                            else {
                                moduleIds.push(module.id);
                            }
                        });
                    }
                    // 存在匿名模块的情况下，通过文件路径解析出模块ID
                    if (anonymousModuleExist) {
                        var ids = amd.getModuleId(
                            path.resolve(file),
                            configFile
                        );
                        moduleIds = moduleIds.concat(ids);
                    }
                }
                else {
                    logger.error('ast parse error in: ' + file);
                }
                if (moduleIds.length) {
                    moduleMap[file] = moduleIds;
                }
            });
        }
    }

    var config = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    // 如果指定了搜索目录，使用指定的搜索目录
    // 如果没有就将 module.conf 中配置的 baseUrl 作为搜索目录
    if (!dir) {
        dir = path.resolve(
            path.dirname(configFile),
            config.baseUrl
        );
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

    return moduleMap;
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
    var moduleMap = getModuleMap(configFile, searchDir);
    for (var file in moduleMap) {
        var moduleIds = moduleMap[file];
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

exports.listModule = listModule;
exports.findModule = findModule;
















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
