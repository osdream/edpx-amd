/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * 
 **************************************************************************/
 
 
/*
 * path:    lib/calcdeps.js
 * desc:    
 * author:  songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/04/21 17:22:48$
 */

var edp = require('edp-core');
var amd = edp.amd;
var logger = edp.log;

function resolveModuleDeps(moduleId, depMap) {
    var dependencies = [];

    var queue = [moduleId, '\uDEAD'];
    var currentLevel = -1;
    var visited = {};
    function walkQueue() {
        // 结束
        if (!queue.length) {
            return;
        }
        var id = queue.shift();
        // 某一级已经遍历完成
        if ('\uDEAD' == id) {
            currentLevel++;
            queue.push('\uDEAD');
            if(queue.length > 1) {
                walkQueue();
            }
            return;
        }
        // 已经遍历过的模块忽略掉，例如下面的C模块
        // C <- B <- A
        //      C <- A
        // 上面这种情况，C放在第一级依赖中
        if (visited[id]) {
            walkQueue();
            return;
        }
        if (currentLevel >= 0) {
            dependencies[currentLevel] = dependencies[currentLevel] || [];
            dependencies[currentLevel].push(id);
        }
        var deps = depMap[id];
        if (deps) {
            deps.forEach(function(dep) {
                queue.push(dep);
            });
        }
        visited[id] = true;
        walkQueue();
    }
    walkQueue();

    return dependencies;
}

function resolveModuleRequiredBy(moduleId, requiredByMap) {
    var requiredBy = [];

    var queue = [moduleId, '\uDEAD'];
    var currentLevel = -1;
    var visited = {};
    function walkQueue() {
        // 结束
        if (!queue.length) {
            return;
        }
        var id = queue.shift();
        // 某一级已经遍历完成
        if ('\uDEAD' == id) {
            currentLevel++;
            queue.push('\uDEAD');
            if(queue.length > 1) {
                walkQueue();
            }
            return;
        }
        // 已经遍历过的模块忽略掉，例如下面的C模块
        // C <- B <- A
        //      C <- A
        // 上面这种情况，A放在第一级依赖中
        if (visited[id]) {
            walkQueue();
            return;
        }
        if (currentLevel >= 0) {
            requiredBy[currentLevel] = requiredBy[currentLevel] || [];
            requiredBy[currentLevel].push(id);
        }
        var reqBys = requiredByMap[id];
        if (reqBys) {
            reqBys.forEach(function(reqBy) {
                queue.push(reqBy);
            });
        }
        visited[id] = true;
        walkQueue();
    }
    walkQueue();

    return requiredBy;
}

/**
 * 计算指定模块的所有依赖关系，包括依赖它的和被它依赖的
 *
 * @param {modules} modules 模块ID数组
 * @param {string} configFile 模块配置文件
 */
function calcModuleDeps(modules, configFile) {
    var file = require('./file');
    var fileModuleMap = file.searchModules(configFile);

    var depMap = {};
    var requiredByMap = {};
    for (var file in fileModuleMap) {
        var mods = fileModuleMap[file];
        mods.forEach(function(mod) {
            var deps = mod.actualDependencies
                .filter(function(id) {
                    return id != 'require' && id != 'module' && id != 'exports';
                }).map(function(id) {
                    return amd.resolveModuleId(id, mod.id);
                });
            depMap[mod.id] = deps;
            if (mod.aliasIds) {
                mod.aliasIds.forEach(function(id) {
                    depMap[id] = deps;
                });
            }
            deps.forEach(function(dep) {
                requiredByMap[dep] = requiredByMap[dep] || [];
                requiredByMap[dep].push(mod.id);
                if (mod.aliasIds) {
                    requiredByMap[dep].push.apply(requiredByMap[dep], mod.aliasIds)
                }
            });
        });
    }

    var results = [];
    modules.forEach(function(moduleId) {
        results.push({
            id: moduleId,
            dependencies: resolveModuleDeps(moduleId, depMap),
            requiredBy: resolveModuleRequiredBy(moduleId, requiredByMap)
        });
    });

    return results;
}

exports.calcModuleDeps = calcModuleDeps;


















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
