/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * 
 **************************************************************************/
 
 
/*
 * path:    test/data/dummy-project/src/paths.js
 * desc:    
 * author:  songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/08/01 18:55:32$
 */

define('paths', ['ecma/modA', 'ec/modC'], function() {
    require('ecma/modB');
    require('ec/modD');
});



















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
