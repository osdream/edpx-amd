/***************************************************************************
 *
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 *
 * @file:    plugin.js
 * @author:  songao(songao@baidu.com)
 * @version: $Revision$
 * @date:    $Date: 2014/08/01 12:15:29$
 * @desc:    file with plugin
 *
 **************************************************************************/


define('plugin', ['./dirA/modA', './dirB/modB', './dirA/plugA!./dirB/resourceA'], function () {
    require('./dirB/modC');
    require('./dirB/modC');
    require('./dirB/plugB!./dirB/resourceB');
    require('./dirB/plugB!./dirB/resourceB');
});



















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
