/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * 
 **************************************************************************/
 
 
/*
 * path:    visualize.js
 * desc:    
 * author:  songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/04/21 17:03:40$
 */

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
cli.description = '将指定模块的依赖关系可视化';

/**
 * 命令选项信息
 *
 * @type {Array}
 */
cli.options = ['module_conf:', 'format:', 'output:'];

var fs = require('fs');
var edp = require('edp-core');
var path = require('path');

/**
 * 模块命令行运行入口
 * 
 * @param {Array} args 命令运行参数
 * @param {Object} opts 命令选项
 */
cli.main = function (args, opts) {
    var logger = edp.log;
    var format = opts.format || 'console';
    var file = require('../../lib/file');
    var calc = require('../../lib/calc');

    var configFile = opts.module_conf || './module.conf';
    var modules = file.parseModuleIds(args, configFile);
    var structure = calc.calcModuleDeps(modules, configFile)

    if (format == 'console') {
        modules.forEach(function(module) {
            console.log(calc.visualize(structure, module));
            console.log();
        });
    }
    else {
        var tpl = fs.readFileSync(path.resolve(__dirname, '../../lib/tpl/report.tpl'), 'utf-8');

        fs.writeFileSync(
            opts.output || './report.html',
            tpl.replace(/\$\{structure\}/, JSON.stringify(structure))
        );
    }
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;























/* vim: set ts=4 sw=4 sts=4 tw=100 : */
