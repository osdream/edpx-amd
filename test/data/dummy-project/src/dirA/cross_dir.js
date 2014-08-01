/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * 
 **************************************************************************/
 
 
/*
 * path:    cross_dir.js
 * desc:    
 * author:  songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/08/01 16:09:53$
 */

define('dirA/cross_dir', ['dirA/modA', 'modB', '../dirB/modC'], function() {
    require('dirA/modA');
    require('dirB/modB');
    require('../dirB/modD');
});



















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
