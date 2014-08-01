/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * 
 **************************************************************************/
 
 
/*
 * path:    amd.spec.js
 * desc:    
 * author:  songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/08/01 12:12:37$
 */

var fs = require('fs');
var path = require('path');
var file = require('../lib/file');

describe('file', function() {
    function getFilePath(filePath) {
        return path.join(__dirname, 'data/dummy-project', filePath);
    }

    it('relatify', function() {
        var configFile = getFilePath('module.conf');

        // 不同形式的define
        var filePath = getFilePath('src/all_kinds_of_define.js');
        var code = file.relatify(filePath, configFile, {
            outputType: 'return'
        });
        expect(code).toBe(fs.readFileSync(getFilePath('src/all_kinds_of_define.expected.js'), 'utf-8'));

        // 插件
        filePath = getFilePath('src/plugin.js');
        code = file.relatify(filePath, configFile, {
            outputType: 'return'
        });
        expect(code).toBe(fs.readFileSync(getFilePath('src/plugin.expected.js'), 'utf-8'));

        // 跨目录情况
        filePath = getFilePath('src/dirA/cross_dir.js');
        code = file.relatify(filePath, configFile, {
            outputType: 'return'
        });
        expect(code).toBe(fs.readFileSync(getFilePath('src/dirA/cross_dir.expected.js'), 'utf-8'));

        // 含package
        filePath = getFilePath('src/dep.js');
        // 不处理 package
        code = file.relatify(filePath, configFile, {
            outputType: 'return'
        });
        expect(code).toBe(fs.readFileSync(getFilePath('src/dep.not_resolve_all.expected.js'), 'utf-8'));
        // 处理 package
        code = file.relatify(filePath, configFile, {
            outputType: 'return',
            resolveAll: true
        });
        expect(code).toBe(fs.readFileSync(getFilePath('src/dep.resolve_all.expected.js'), 'utf-8'));

        // 含paths
        filePath = getFilePath('src/paths.js');
        // 不处理 package
        code = file.relatify(filePath, configFile, {
            outputType: 'return'
        });
        expect(code).toBe(fs.readFileSync(getFilePath('src/paths.not_resolve_all.expected.js'), 'utf-8'));
        // 处理 package
        code = file.relatify(filePath, configFile, {
            outputType: 'return',
            resolveAll: true
        });
        expect(code).toBe(fs.readFileSync(getFilePath('src/paths.resolve_all.expected.js'), 'utf-8'));
    });
});

















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
