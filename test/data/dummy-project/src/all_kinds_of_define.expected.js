/***************************************************************************
 *
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 * @file:    test/data/dummy-project/src/all_kinds_of_define.js
 * @author:  songao(songao@baidu.com)
 * @version: $Revision$
 * @date:    $Date: 2014/08/01 19:25:03$
 * @desc:    all kinds of define
 *
 **************************************************************************/


define(function () {
});

define('hello', function () {
});

define(['./oo', './test'], function () {
});

define('hello', ['./oo', './test'], function () {
    require('./abc');
    require('./abc');
    require('./abc');
    require('er/abc');
    require('ecma/tpl!./list.html');
});



















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
