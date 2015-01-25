/***************************************************************************
 *
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 * @file:    test/data/dummy-project/src/dep.js
 * @author:  songao(songao@baidu.com)
 * @version: $Revision$
 * @date:    $Date: 2014/08/01 16:18:10$
 * @desc:    file with dep
 *
 **************************************************************************/


define(
    'dep',
    [
        '../dep/er/3.1.0-beta.4/src/Action',
        '../dep/er/3.1.0-beta.4/src/tpl!./dirA/list.html'
    ],
    function () {
        require('../dep/er/3.1.0-beta.4/src/Action');
        require('../dep/er/3.1.0-beta.4/src/tpl!./dirA/form.html');
    }
);



















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
