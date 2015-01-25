/***************************************************************************
 *
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 * @file:    cli/amd/relatify.js
 * @author:  songao(songao@baidu.com)
 * @version: $Revision$
 * @date:    $Date: 2014/07/31 12:31:27$
 * @desc:    对指定的文件里的模块 ID 转化为相对 ID
 *
 **************************************************************************/


/**
 * @inner
 * @type {Object}
 */
var cli = {};

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = '对指定的文件里的模块 ID 转化为相对 ID';

/**
 * 命令选项信息
 *
 * @type {Array}
 */
cli.options = ['dir:', 'module_conf:', 'resolve_all'];

var fs = require('fs');
var edp = require('edp-core');
var path = require('path');
var util = edp.util;

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 * @param {Object} opts 命令选项
 */
cli.main = function (args, opts) {
    var files = args;
    var file = require('../../lib/file');
    var configFile = opts.module_conf || './module.conf';
    var resolveAll = opts.resolve_all;
    var outputType = opts.output_type || 'overwrite';
    function processFile(filePath) {
        if (outputType !== 'console') {
            console.log('processing ' + filePath);
        }
        file.relatify(filePath, configFile, {
            resolveAll: resolveAll,
            outputType: outputType
        });
    }
    if (files.length) {
        files.forEach(function (subFile) {
            var stat = fs.statSync(subFile);
            if (stat.isDirectory()) {
                util.scanDir(subFile, function (sFile) {
                    if (!/\.js$/.test(sFile)) {
                        return;
                    }
                    processFile(sFile);
                });
            }
            else if (stat.isFile()) {
                processFile(subFile);
            }
        });
    }
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;






















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
