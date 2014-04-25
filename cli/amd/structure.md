structure
---------

### Usage

edp amd structure <module> [, <module>]
edp amd structure <module> [--module_conf=moduleConfFile]

### Options

+ --module_conf - 指定模块配置文件，不指定时使用 `./module.conf`


### Description

分析指定模块的依赖关系，生成符合 `d3js` 展示的数据格式，包括依赖哪些模块的和被哪些模块依赖。可同时指定多个模块，分组列出依赖关系。

输出数据格式如下：

```
{
    "directed": true,
    "multigraph": false,
    "graph": [],
    "nodes": [ // 模块作为节点
        {
            "id": "esui/Panel"
        },
        {
            "id": "underscore"
        },
    ],
    "links": [ // 依赖关系用连接展示，这里的数字就是nodes里模块的index
        {
            "source": 0,
            "target": 1
        }
    ]
}
```
