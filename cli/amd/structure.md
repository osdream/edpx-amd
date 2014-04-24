structure
---------

### Usage

edp amd structure <module> [, <module>]
edp amd structure <module> [--module_conf=moduleConfFile]

### Options

+ --module_conf - 指定模块配置文件，不指定时使用 `./module.conf`


### Description

分析指定模块的依赖关系，分层列出，包括依赖哪些模块的和被哪些模块依赖。可同时指定多个模块，分组列出依赖关系。


