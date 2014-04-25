visualize
---------

### Usage

edp amd visualize <module> [, <module>]
edp amd visualize <module> [--module_conf=moduleConfFile]

### Options

+ --module_conf - 指定模块配置文件，不指定时使用 `./module.conf`
+ --format - 指定输出方式，支持html/console，默认为console
+ --output - 在format是html时，用于指定输出文件，默认为 `report.html`


### Description

对 `edp structure` 的输出进行可视化展现，输出到console或者生成一个html文件。


