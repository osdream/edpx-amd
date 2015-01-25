/***************************************************************************
 *
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 * @file:    test/data/dummy-project/src/paths.js
 * @author:  songao(songao@baidu.com)
 * @version: $Revision$
 * @date:    $Date: 2014/08/01 18:55:32$
 * @desc:    file with paths
 *
 **************************************************************************/


define('paths', ['ecma/common/basic/modA', 'ec/modC'], function () {
    require('ecma/common/basic/modB');
    require('ec/modD');
});



















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
