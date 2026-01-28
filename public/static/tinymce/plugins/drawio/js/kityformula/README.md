# CKeditor编辑器数学公式插件-图片版
基于CKeditor编辑器的可视化的数学公式编辑器，可以返回数学公式。

### 版本说明
 这个版本是从百度UEditor编辑器【UEditor 公式插件】->【[UEditor公式插件传送门](https://ueditor.baidu.com/website/kityformula.html)】移植过来的。主要解决我们公司的考试系统导出的Word上一个编辑器乱码的问题，我想了很久一只不能将CSS引入到word里面去，所以上一个公式编辑器生产的公式在网页上正常，一旦放到word就“乱码”。
最后我们决定将公式转成图片。这样所有的问题都迎刃而解。


W：为啥不直接用百度UE编辑器？

Q：停止维护好多年了。。。。


顺便宣传一下我们公司【[合肥海辰信息科技有限公司](https://www.hcxxkj.com/)】

### 图片版本特点

1. 支持右键编辑公式
2. 支持公式二次编辑
3. 支持导出word

计划增加两种插件的互相二次编辑的支持

### 演示地址
[演示Deom传送门](http://jdmath.jdun.org/)

[纯网页版公式编辑器传送门](https://gitee.com/jdmx/JDMath)


### 使用说明 

将
CKeditor编辑器的config.js打开，在
```
CKEDITOR.editorConfig = function( config ) {};
```
里面添加
```
config.extraPlugins = 'kityformula';
```

配置完后即可使用


### 方案一

将公式只让公式编辑器返回LaTeX代码，然后重新进行渲染。看了CKeditor官方的公式插件就是这么做的，但是他的插入公式部分需要手写LaTeX代码。非常的不人性化。

### config.js代码参考
```
CKEDITOR.editorConfig = function( config ) {
    config.extraPlugins = 'kityformula';
};
```

![效果图](https://images.gitee.com/uploads/images/2018/1128/034230_cf3c4bce_405677.png "效果图")