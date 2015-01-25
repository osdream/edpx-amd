/***************************************************************************
 *
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 * @file:    lib/calc.js
 * @author:  songao(songao@baidu.com)
 * @version: $Revision$
 * @date:    $Date: 2014/04/21 17:22:48$
 * @desc:    计算模块依赖关系
 *
 **************************************************************************/


var fs = require('fs');
var edp = require('edp-core');
var amd = edp.amd;
var logger = edp.log;

/**
 * 根据指定模块和其依赖关系扩展树元数据
 *
 * @param {Object} tree 已有的树元数据
 * @param {Object.<string, Array>} depMap 包含模块和其依赖模块的映射关系的 Map
 * @param {Array.<string>} seeds 指定要计算依赖关系的起点模块
 * @param {Object} context 树构建上下文
 * @return {Object}
 */
function growWithModuleDeps(tree, depMap, seeds, context) {
    var queue = JSON.parse(JSON.stringify(seeds));
    var visited = {};
    var nodeIndexMap = context.nodeIndexMap = context.nodeIndexMap || {};
    var linkExistMap = context.linkExistMap = context.linkExistMap || {};
    function walkQueue() {
        // 结束
        if (!queue.length) {
            return;
        }
        var id = queue.shift();
        // 已经遍历过的模块忽略掉，例如下面的C模块
        // C <- B <- A
        //      C <- A
        if (visited[id]) {
            walkQueue();
            return;
        }
        // 增加树节点
        var candidateNode = [id];
        var deps = depMap[id];
        if (deps) {
            candidateNode = candidateNode.concat(deps);
        }
        candidateNode.forEach(function (id) {
            if (nodeIndexMap[id] == null) {
                tree.nodes.push({
                    id: id
                });
                nodeIndexMap[id] = tree.nodes.length - 1;
            }
        });
        if (deps) {
            deps.forEach(function (dep) {
                queue.push(dep);
                var key = id + '_' + dep;
                if (linkExistMap[key] == null) {
                    tree.links.push({
                        source: nodeIndexMap[id],
                        target: nodeIndexMap[dep]
                    });
                    linkExistMap[key] = true;
                }
            });
        }
        visited[id] = true;
        walkQueue();
    }
    walkQueue();

    return tree;
}

/**
 * 根据指定模块的被依赖关系扩展树元数据
 *
 * @param {Object} tree 已有的树元数据
 * @param {Object.<string, Array>} requiredByMap 包含模块和其被依赖模块的映射关系的 Map
 * @param {Array.<string>} seeds 指定要计算依赖关系的起点模块
 * @param {Object} context 树构建上下文
 * @return {Object}
 */
function growWithRequiredBy(tree, requiredByMap, seeds, context) {
    var queue = JSON.parse(JSON.stringify(seeds));
    var visited = {};
    var nodeIndexMap = context.nodeIndexMap = context.nodeIndexMap || {};
    var linkExistMap = context.linkExistMap = context.linkExistMap || {};
    function walkQueue() {
        // 结束
        if (!queue.length) {
            return;
        }
        var id = queue.shift();
        // 已经遍历过的模块忽略掉，例如下面的C模块
        // C <- B <- A
        //      C <- A
        if (visited[id]) {
            walkQueue();
            return;
        }
        // 增加树节点
        var candidateNode = [id];
        var reqBys = requiredByMap[id];
        if (reqBys) {
            candidateNode = candidateNode.concat(reqBys);
        }
        candidateNode.forEach(function (id) {
            if (nodeIndexMap[id] == null) {
                tree.nodes.push({
                    id: id
                });
                nodeIndexMap[id] = tree.nodes.length - 1;
            }
        });
        if (reqBys) {
            reqBys.forEach(function (reqBy) {
                queue.push(reqBy);
                var key = reqBy + '_' + id;
                if (linkExistMap[key] == null) {
                    tree.links.push({
                        source: nodeIndexMap[reqBy],
                        target: nodeIndexMap[id]
                    });
                    linkExistMap[key] = true;
                }
            });
        }
        visited[id] = true;
        walkQueue();
    }
    walkQueue();

    return tree;
}

/**
 * 计算指定模块的所有依赖关系，包括依赖它的和被它依赖的
 *
 * @param {modules} modules 模块ID数组
 * @param {string} configFile 模块配置文件
 * @return {Object}
 */
function calcModuleDeps(modules, configFile) {
    if (!fs.existsSync(configFile)) {
        logger.error('module.conf not found: ' + configFile);
        return [];
    }
    var fileModuleMap = require('./file').searchModules(configFile);
    var depMap = {};
    var requiredByMap = {};
    /* eslint-disable no-loop-func */
    for (var file in fileModuleMap) {
        if (fileModuleMap.hasOwnProperty(file)) {
            var mods = fileModuleMap[file];
            mods.forEach(function (mod) {
                var deps = mod.actualDependencies
                    .filter(function (id) {
                        return id !== 'require' && id !== 'module' && id !== 'exports';
                    })
                    .map(function (id) {
                        return amd.resolveModuleId(id, mod.id);
                    });
                depMap[mod.id] = deps;
                if (mod.aliasIds) {
                    mod.aliasIds.forEach(function (id) {
                        depMap[id] = deps;
                    });
                }
                deps.forEach(function (dep) {
                    requiredByMap[dep] = requiredByMap[dep] || [];
                    requiredByMap[dep].push(mod.id);
                    if (mod.aliasIds) {
                        requiredByMap[dep].push.apply(requiredByMap[dep], mod.aliasIds);
                    }
                });
            });
        }
    }
    /* eslint-enable no-loop-func */

    var seeds = modules;
    var voidTree = {
        'directed': true,
        'multigraph': false,
        'graph': [],
        'nodes': [],
        'links': []
    };
    var context = {};
    var litTree = growWithModuleDeps(voidTree, depMap, seeds, context);
    var bigTree = growWithRequiredBy(litTree, requiredByMap, seeds, context);

    return bigTree;
}

/**
 * 数组去重
 *
 * @param {Array.<Array>} array 二维数组
 * @return {Array.<Array>}
 */
function unique(array) {
    array.forEach(function (subArray, i) {
        var map = {};
        array[i] =  subArray.filter(function (item) {
            if (!map[item]) {
                map[item] =  true;
                return true;
            }
            return false;
        });
    });

    return array;
}

/**
 * 自动调节字符串间间隔，以类似表格的方式对齐显示字符串数组
 *
 * @param {Array.<string>} array 字符串数组
 * @return {string}
 */
function alignify(array) {
    var lineWidth = 100;
    var total = 0;
    array.forEach(function (item) {
        total += item.length + 2;
    });
    var average = total / array.length;
    var possibleColumnNumber = Math.ceil(lineWidth / average);
    var colMaxArr = [];
    function tryIt() {
        var lines = [];
        var i;
        for (i = 0; i < array.length; i++) {
            var rowIndex = parseInt(i / possibleColumnNumber, 10);
            lines[rowIndex] = lines[rowIndex] || [];
            lines[rowIndex].push(array[i].length + 2);
        }
        colMaxArr = [];
        for (i = 0; i < possibleColumnNumber; i++) {
            var col = [0];
            for (var j = 0; j < lines.length; j++) {
                lines[j][i] && col.push(lines[j][i]);
            }
            colMaxArr.push(Math.max.apply(Math, col));
        }
        var maxTotal = 0;
        colMaxArr.forEach(function (item) {
            maxTotal += item;
        });
        if (maxTotal > lineWidth && possibleColumnNumber > 1) {
            possibleColumnNumber--;
            tryIt();
        }
    }
    tryIt();

    var columnNumber = possibleColumnNumber;
    var lines = [];
    for (var i = 0; i < array.length; i++) {
        var rowIndex = parseInt(i / columnNumber, 10);
        var colIndex = i % columnNumber;
        lines[rowIndex] = lines[rowIndex] || '';
        var max = colMaxArr[colIndex];
        var diff = max - array[i].length;
        var space = '';
        for (var j = 0; j < diff; j++) {
            space += ' ';
        }
        lines[rowIndex] += array[i] + space;
    }
    return lines.join('\n');
}

/**
 * 将依赖关系可视化，输出到console
 *
 * @param {Object} structure 依赖关系图数据
 * @param {string}module  要展示依赖关系的模块
 * @return {string}
 */
function visualize(structure, module) {
    var nodes = structure.nodes;
    var links = structure.links;

    var sourceMap = {};
    var targetMap = {};
    links.forEach(function (link) {
        sourceMap[link.source] = sourceMap[link.source] || [];
        sourceMap[link.source].push(link.target);
        targetMap[link.target] = targetMap[link.target] || [];
        targetMap[link.target].push(link.source);
    });

    var nodeIndexMap = {};
    var startNodeIndex = null;
    nodes.forEach(function (node, i) {
        nodeIndexMap[i] = node.id;
        if (module === node.id) {
            startNodeIndex = i;
        }
    });

    function grow(map) {
        var level = 0;
        var levels = [];
        var queue = [startNodeIndex];
        var nextQueue = [];
        var visited = {};
        function walk() {
            if (!queue.length) {
                if (nextQueue.length) {
                    queue = nextQueue;
                    nextQueue = [];
                    level++;
                    walk();
                }
                return;
            }
            var id = queue.shift();
            if (visited[id]) {
                walk();
                return;
            }
            levels[level] = levels[level] || [];
            levels[level].push(id);
            nextQueue = nextQueue.concat(map[id] || []);
            visited[id] = true;
            walk();
        }
        walk();

        return levels;
    }
    var depLevels = unique(grow(sourceMap));
    var reqLevels = unique(grow(targetMap));

    var log = [
        '[' + edp.chalk.green('modules are required by ' + module) + ']: '
    ];
    depLevels.reverse().forEach(function (level) {
        var ids = level.map(function (index) {
            return nodeIndexMap[index];
        });
        log.push(alignify(ids));
        log.push('    ↑');
    });
    log.pop();

    log.push('\n');
    log.push(
        '[' + edp.chalk.green('modules depend on ' + module) + ']: '
    );
    reqLevels.forEach(function (level) {
        var ids = level.map(function (index) {
            return nodeIndexMap[index];
        });
        log.push(alignify(ids));
        log.push('    ↑');
    });
    log.pop();

    return log.join('\n');
}

exports.calcModuleDeps = calcModuleDeps;
exports.visualize = visualize;


















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
