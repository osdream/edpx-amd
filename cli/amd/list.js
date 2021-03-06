/***************************************************************************
 *
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 * @file:    list.js
 * @author:  songao(songao@baidu.com)
 * @version: $Revision$
 * @date:    $Date: 2014/04/21 17:04:07$
 * @desc:    列出JS文件里包含的 `AMD` 模块
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
cli.description = '列出指定 JS 文件里包含的 AMD 模块';

/**
 * 命令选项信息
 *
 * @type {Array}
 */
cli.options = ['module_conf:'];

var fs = require('fs');
var edp = require('edp-core');

/**
 * 模块命令行运行入口
 *
 * @param {Array} args 命令运行参数
 * @param {Object} opts 命令选项
 */
cli.main = function (args, opts) {
    var logger = edp.log;
    var files = [];
    args.forEach(function (file) {
        if (!fs.existsSync(file)) {
            logger.error('File not exists: ' + file);
        }
        else {
            files.push(file);
        }
    });

    // 当没有指明文件时，直接将当前目录下的所有文件作为输入
    if (!files.length) {
        files.push('.');
    }

    var file = require('../../lib/file');
    var configFile = opts.module_conf || './module.conf';
    file.listModule(files, configFile)
        .then(function (results) {
            results.forEach(function (item) {
                console.log('[' + edp.chalk.green(item.file) + '] has modules: ');
                item.modules.forEach(function (module) {
                    if (module.id) {
                        var id = module.id;
                        if (module.aliasIds && module.aliasIds.length) {
                            id = id + ', ' + module.aliasIds.join(', ');
                        }
                        console.log(id);
                    }
                    else {
                        console.log('an anonymous module found');
                    }
                });
                console.log();
            });
        })
        .fail(function (err) {
            logger.error(err);
        });
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;



















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
