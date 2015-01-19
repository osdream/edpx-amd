edpx-amd
========

AMD related tools: analysis and visualization

### find

**Usage**


```
edp amd find <module> [, <module>]
edp amd find <module> [--dir=searchDir]
edp amd find <module> [--module_conf=moduleConfFile]
```

**Options**

```
+ --dir - 可选，指定搜索目录。不指定时搜索 `module.conf` 所处目录
+ --module_conf - 指定模块配置文件，不指定时使用 `./module.conf`
```

**Description**

找到指定 `AMD` 模块所处的文件。可同时指定多个模块，分组列出所处文件。

### list

**Usage**

```
edp amd list <file> [, <file>]
edp amd list <file> [--module_conf=moduleConfFile]
```

**Options**

```
+ --module_conf - 指定模块配置文件，不指定时使用 `./module.conf`
```

**Description**

列出指定 JS 文件里包含的 `AMD` 模块。可同时指定多个文件，分组列出包含模块。

### structure

**Usage**

```
edp amd structure <module> [, <module>]
edp amd structure <module> [--module_conf=moduleConfFile]
```

**Options**

```
+ --module_conf - 指定模块配置文件，不指定时使用 `./module.conf`
```

**Description**

分析指定模块的依赖关系，生成符合 `d3js` 展示的数据格式，包括依赖哪些模块的和被哪些模块依赖。可同时指定多个模块，分组列出依赖关系。

输出数据格式如下：

```javascript
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

### visualize

**Usage**

```
edp amd visualize <module> [, <module>]
edp amd visualize <module> [--module_conf=moduleConfFile]
```

**Options**

```
+ --module_conf - 指定模块配置文件，不指定时使用 `./module.conf`
+ --format - 指定输出方式，支持html/console，默认为console
+ --output - 在format是html时，用于指定输出文件，默认为 `report.html`
```

**Description**

对 `edp structure` 的输出进行可视化展现，输出到console或者生成一个html文件。



### relatify

**Usage**

```
edp amd relatify [--module_conf=moduleConfFile] [--resolve_all] [--output_type=&lt;type&gt;] &lt;file|dir&gt; [, &lt;file|dir&gt;]
```

**Options**

```
+ --module_conf - 指定模块配置文件，不指定时使用 `./module.conf`
+ --output_type - 可选，输出方式：overwrite/copy/console，默认是直接改写文件(overwrite)
+ --resolve_all - 设置是否对使用 package 和 paths 的 id 做处理，默认为false
```

**Description**

将指定 JS 文件里包含的模块 ID 转化为相对 ID。



