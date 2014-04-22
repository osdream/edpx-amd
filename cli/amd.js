/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$ 
 * 
 **************************************************************************/
 
 
/*
 * path:    cli/amd.js
 * desc:    
 * author:  songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/04/21 13:30:25$
 */

/**
 * 命令行配置项
 *
 * @inner
 * @type {Object}
 */
var cli = {};

/**
 * 命令描述信息
 *
 * @type {string}
 */
cli.description = 'AMD模块相关工具';

/**
 * 模块命令行运行入口
 * 
 * @param {Array} args 命令运行参数
 */
cli.main = function (args) {
    console.log( 'See `edp amd --help`' );
};

/**
 * 命令行配置项
 *
 * @type {Object}
 */
exports.cli = cli;






















/* vim: set ts=4 sw=4 sts=4 tw=100: */
