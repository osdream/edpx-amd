relatify
---------

### Usage

edp amd relatify [--module_conf=moduleConfFile] [--resolve_all] [--output_type=&lt;type&gt;] &lt;file|dir&gt; [, &lt;file|dir&gt;]

### Options

+ --module_conf - 指定模块配置文件，不指定时使用 `./module.conf`
+ --output_type - 可选，输出方式：overwrite/copy/console，默认是直接改写文件(overwrite)
+ --resolve_all - 设置是否对使用 package 和 paths 的 id 做处理，默认为false


### Description

将指定 JS 文件里包含的模块 ID 转化为相对 ID。


