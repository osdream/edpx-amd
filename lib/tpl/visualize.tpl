<!doctype html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1">
<title>html-title</title>
<style type="text/css">
/*<![CDATA[*/
h1 {
  font: bold 24px verdana,sans-serif;
  margin: 0px;
  margin-bottom: 14px;
}

div {
  position: relative;
  font: normal 9px verdana,sans-serif;
  padding: 3px;
  margin: 5px;
  background-color: #EEE;
  border: 1px solid #999;
  cursor: pointer;
  color: #333;
}


div.hover {
  background-color: #EE6;
  border: 1px solid #990;
  color: #000;
}

div.hilite {
  background-color: #AFA;
  border: 1px solid #090;
}

div.infile {
  background-color: #FFA;
  border: 1px solid #990;
}

div.required {
  background-color: #FAA;
  border: 1px solid #900;
}

div.dep-center {
  background-color: #AFA;
  border: 1px solid #090;
}
/*]]>*/
</style>

<script type="text/javascript">
/*<![CDATA[*/
var structure = ${structure};
/*]]>*/
</script>

<!--[if IE]> IE <![endif]-->
<!--[if IE 6]> version 6/+  <![endif]-->
<!--[if gte IE 7]> version 7/+  <![endif]-->
</head>
<body>
<script type="text/javascript">
for (var k = 0; k < structure.length; k++) {
    var module = structure[k];
    document.write('<table><tr>')
    var deps = module.dependencies.reverse();
    for (var i = 0; i < deps.length; i++) {
        document.write('<td>');
        var level = deps[i];
        for (var j = 0; j < level.length; j++) {
            document.write('<div id="' + level[j] + '" class="dep">'+ level[j] +'</div>');
        }
    }
    document.write('<td><div id="' + module.id + '" class="dep dep-center">'+ module.id +'</div></td>');
    var reqBys = module.requiredBy;
    for (var i = 0; i < reqBys.length; i++) {
        document.write('<td>');
        var level = reqBys[i];
        for (var j = 0; j < level.length; j++) {
            document.write('<div id="' + level[j] + '" class="dep">'+ level[j] +'</div>');
        }
    }
    document.write('</tr></table>')
}
</script>
</body>
</html>
