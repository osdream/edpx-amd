/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * 
 **************************************************************************/
 
 
/*
 * path:    structure.js
 * desc:    
 * author:  songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/04/21 17:03:41$
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
cli.description = '找到指定 AMD 模块所处的文件';

/**
 * 命令选项信息
 *
 * @type {Array}
 */
cli.options = ['module_conf:'];

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
    var modules = args;

    var calcdeps = require('../../lib/calcdeps');
    var configFile = opts.module_conf || './module.conf';
    var results = calcdeps.calcModuleDeps(modules, configFile)
    console.log(JSON.stringify(results, null, 4));
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;























/* vim: set ts=4 sw=4 sts=4 tw=100 : */
