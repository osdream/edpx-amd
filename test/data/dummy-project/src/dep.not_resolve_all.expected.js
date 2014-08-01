/***************************************************************************
 * 
 * Copyright (c) 2014 Baidu.com, Inc. All Rights Reserved
 * $Id$
 * 
 **************************************************************************/
 
 
/*
 * path:    test/data/dummy-project/src/dep.js
 * desc:    
 * author:  songao(songao@baidu.com)
 * version: $Revision$
 * date:    $Date: 2014/08/01 16:18:10$
 */

define('dep', ['er/Action', 'er/tpl!./dirA/list.html'], function() {
    require('er/Action');
    require('er/tpl!./dirA/form.html');
});



















/* vim: set ts=4 sw=4 sts=4 tw=100 : */
