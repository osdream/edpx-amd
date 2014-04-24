find
---------

### Usage

edp amd find <module> [, <module>]
edp amd find <module> [--dir=searchDir]
edp amd find <module> [--module_conf=moduleConfFile]

### Options

+ --dir - 可选，指定搜索目录。不指定时搜索 `module.conf` 所处目录
+ --module_conf - 指定模块配置文件，不指定时使用 `./module.conf`


### Description

找到指定 `AMD` 模块所处的文件。可同时指定多个模块，分组列出所处文件。

