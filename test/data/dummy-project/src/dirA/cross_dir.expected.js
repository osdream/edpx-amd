/***************************************************************************
 *
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 * @file:    cross_dir.js
 * @author:  songao(songao@baidu.com)
 * @version: $Revision$
 * @date:    $Date: 2014/08/01 16:09:53$
 * @desc:    file with cross_dir require
 *
 **************************************************************************/


define('dirA/cross_dir', ['./modA', '../modB', '../dirB/modC'], function () {
    require('./modA');
    require('../dirB/modB');
    require('../dirB/modD');
});



















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
