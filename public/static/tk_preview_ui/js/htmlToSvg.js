var CryptoJS = CryptoJS || function(a, r) {
  var t = {}
    , e = t.lib = {}
    , n = e.Base = function() {
      function r() {}
      return {
          extend: function(t) {
              r.prototype = this;
              var e = new r;
              t && e.mixIn(t);
              e.$super = this;
              return e
          },
          create: function() {
              var t = this.extend();
              t.init.apply(t, arguments);
              return t
          },
          init: function() {},
          mixIn: function(t) {
              for (var e in t)
                  t.hasOwnProperty(e) && (this[e] = t[e]);
              t.hasOwnProperty("toString") && (this.toString = t.toString)
          },
          clone: function() {
              return this.$super.extend(this)
          }
      }
  }()
    , c = e.WordArray = n.extend({
      init: function(t, e) {
          t = this.words = t || [];
          this.sigBytes = e != r ? e : 4 * t.length
      },
      toString: function(t) {
          return (t || s).stringify(this)
      },
      concat: function(t) {
          var e = this.words
            , r = t.words
            , n = this.sigBytes
            , t = t.sigBytes;
          this.clamp();
          if (n % 4)
              for (var i = 0; i < t; i++)
                  e[n + i >>> 2] |= (r[i >>> 2] >>> 24 - 8 * (i % 4) & 255) << 24 - 8 * ((n + i) % 4);
          else if (65535 < r.length)
              for (i = 0; i < t; i += 4)
                  e[n + i >>> 2] = r[i >>> 2];
          else
              e.push.apply(e, r);
          this.sigBytes += t;
          return this
      },
      clamp: function() {
          var t = this.words
            , e = this.sigBytes;
          t[e >>> 2] &= 4294967295 << 32 - 8 * (e % 4);
          t.length = a.ceil(e / 4)
      },
      clone: function() {
          var t = n.clone.call(this);
          t.words = this.words.slice(0);
          return t
      },
      random: function(t) {
          for (var e = [], r = 0; r < t; r += 4)
              e.push(4294967296 * a.random() | 0);
          return c.create(e, t)
      }
  })
    , i = t.enc = {}
    , s = i.Hex = {
      stringify: function(t) {
          for (var e = t.words, t = t.sigBytes, r = [], n = 0; n < t; n++) {
              var i = e[n >>> 2] >>> 24 - 8 * (n % 4) & 255;
              r.push((i >>> 4).toString(16));
              r.push((i & 15).toString(16))
          }
          return r.join("")
      },
      parse: function(t) {
          for (var e = t.length, r = [], n = 0; n < e; n += 2)
              r[n >>> 3] |= parseInt(t.substr(n, 2), 16) << 24 - 4 * (n % 8);
          return c.create(r, e / 2)
      }
  }
    , o = i.Latin1 = {
      stringify: function(t) {
          for (var e = t.words, t = t.sigBytes, r = [], n = 0; n < t; n++)
              r.push(String.fromCharCode(e[n >>> 2] >>> 24 - 8 * (n % 4) & 255));
          return r.join("")
      },
      parse: function(t) {
          for (var e = t.length, r = [], n = 0; n < e; n++)
              r[n >>> 2] |= (t.charCodeAt(n) & 255) << 24 - 8 * (n % 4);
          return c.create(r, e)
      }
  }
    , f = i.Utf8 = {
      stringify: function(t) {
          try {
              return decodeURIComponent(escape(o.stringify(t)))
          } catch (t) {
              throw Error("Malformed UTF-8 data")
          }
      },
      parse: function(t) {
          return o.parse(unescape(encodeURIComponent(t)))
      }
  }
    , u = e.BufferedBlockAlgorithm = n.extend({
      reset: function() {
          this._data = c.create();
          this._nDataBytes = 0
      },
      _append: function(t) {
          "string" == typeof t && (t = f.parse(t));
          this._data.concat(t);
          this._nDataBytes += t.sigBytes
      },
      _process: function(t) {
          var e = this._data
            , r = e.words
            , n = e.sigBytes
            , i = this.blockSize
            , s = n / (4 * i)
            , s = t ? a.ceil(s) : a.max((s | 0) - this._minBufferSize, 0)
            , t = s * i
            , n = a.min(4 * t, n);
          if (t) {
              for (var o = 0; o < t; o += i)
                  this._doProcessBlock(r, o);
              o = r.splice(0, t);
              e.sigBytes -= n
          }
          return c.create(o, n)
      },
      clone: function() {
          var t = n.clone.call(this);
          t._data = this._data.clone();
          return t
      },
      _minBufferSize: 0
  });
  e.Hasher = u.extend({
      init: function() {
          this.reset()
      },
      reset: function() {
          u.reset.call(this);
          this._doReset()
      },
      update: function(t) {
          this._append(t);
          this._process();
          return this
      },
      finalize: function(t) {
          t && this._append(t);
          this._doFinalize();
          return this._hash
      },
      clone: function() {
          var t = u.clone.call(this);
          t._hash = this._hash.clone();
          return t
      },
      blockSize: 16,
      _createHelper: function(r) {
          return function(t, e) {
              return r.create(e).finalize(t)
          }
      },
      _createHmacHelper: function(r) {
          return function(t, e) {
              return h.HMAC.create(r, e).finalize(t)
          }
      }
  });
  var h = t.algo = {};
  return t
}(Math);
(function() {
  var t = CryptoJS
    , c = t.lib.WordArray;
  t.enc.Base64 = {
      stringify: function(t) {
          var e = t.words
            , r = t.sigBytes
            , n = this._map;
          t.clamp();
          for (var t = [], i = 0; i < r; i += 3)
              for (var s = (e[i >>> 2] >>> 24 - 8 * (i % 4) & 255) << 16 | (e[i + 1 >>> 2] >>> 24 - 8 * ((i + 1) % 4) & 255) << 8 | e[i + 2 >>> 2] >>> 24 - 8 * ((i + 2) % 4) & 255, o = 0; 4 > o && i + .75 * o < r; o++)
                  t.push(n.charAt(s >>> 6 * (3 - o) & 63));
          if (e = n.charAt(64))
              for (; t.length % 4; )
                  t.push(e);
          return t.join("")
      },
      parse: function(t) {
          var t = t.replace(/\s/g, "")
            , e = t.length
            , r = this._map
            , n = r.charAt(64);
          n && (n = t.indexOf(n),
          -1 != n && (e = n));
          for (var n = [], i = 0, s = 0; s < e; s++)
              if (s % 4) {
                  var o = r.indexOf(t.charAt(s - 1)) << 2 * (s % 4)
                    , a = r.indexOf(t.charAt(s)) >>> 6 - 2 * (s % 4);
                  n[i >>> 2] |= (o | a) << 24 - 8 * (i % 4);
                  i++
              }
          return c.create(n, i)
      },
      _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
  }
}
)();
 




//加载字体
var textToSvgData = {};
var text_fontCofnig = {
  'simsun': './fonts/SimSun.ttf',//宋体
  'times new roman': './fonts/times.ttf',//新罗马
  'times new roman italic': './fonts/timesi.ttf',//新罗马常规斜体
  'times new roman bold': './fonts/timesbd.ttf',//新罗马加粗
  'times new roman italic bold': './fonts/timesbi.ttf',//新罗马加粗斜体
  'simhei': './fonts/SimHei.ttf',//黑体
  'ms mincho': './fonts/MS Mincho.ttf',//日语
  'simfang': './fonts/simfang.ttf',//仿宋
  'simkai': './fonts/simkai.ttf',//楷体
  'simkai': './fonts/simkai.ttf',//楷体
  'serif':'./fonts/SansSerifCollection.TTF'
  
};
let changeCharObj = {
  '∼': '~', // ～
  '⟨': '〈',
  '⟩': '〉',
  '⌈': '「',
  '⌉': '┒',
  '⌊': '┖',
  '⌋': '」',
  
  '⓵': '①',
  '⓶': '②',
  '⓷': '③',
  '⓸': '④',
  '⓹': '⑤',
  '⓺': '⑥',
  '⓻': '⑦',
  '⓼': '⑧',
  '⓽': '⑨',
  '⓾': '⑩',
};

(function () {

  for (var config in text_fontCofnig) {
    TextToSVG.load(text_fontCofnig[config], config, function (e, v) {
    
      console.log(e,v.font.unitsPerEm)
      // if(v.font.unitsPerEm == 256){
      //   debugger
      //   v.font = convertUnitsPerEm(v.font);

      //   console.log("转换后 ",e,v.font.unitsPerEm)
      // }

      textToSvgData[e.trim().toLocaleLowerCase()] = v;
    });
  }
})()

async function convertUnitsPerEm(font) {  
  // 计算缩放比例 (1000 / 256)
  const scale = 1000 / font.unitsPerEm;
  
  // 创建新字体对象并设置新的unitsPerEm
  const newFont = new opentype.Font({
      familyName: font.names.fontFamily.en,
      styleName: font.names.fontSubfamily.en,
      unitsPerEm: 1000,
      ascender: Math.round(font.ascender * scale),
      descender: Math.round(font.descender * scale),
      glyphs: []
  })

  // 缩放所有字形
  for(var key in font.glyphs.glyphs){
    const glyph = font.glyphs.glyphs[key];
    
    const scaledPath = new opentype.Path();
    // 缩放路径命令（兼容 M/L/C/Q/Z 等指令）[4](@ref)
    glyph.path.commands.forEach(cmd => {
      if (cmd.type  =='M') {
        scaledPath.moveTo(...cmd.args.map(arg => Math.round(arg * scale))); 
      }
      else if (cmd.type  =='L') {
        scaledPath.lineTo(...cmd.args.map(arg => Math.round(arg * scale))); 
      }
      else if (cmd.type  =='C') {
        scaledPath.curveTo(...cmd.args.map(arg => Math.round(arg * scale))); 
      }else if (cmd.type  =='Q') {
        scaledPath.quadTo(...cmd.args.map(arg => Math.round(arg * scale))); 
      }
      else if (cmd.type  =='Z') {
         scaledPath.close(); 
      }

    })
    // 添加缩放后的字形
    newFont.glyphs.glyphs.push(new opentype.Glyph({
        name: glyph.name,
        unicode: glyph.unicode,
        advanceWidth: Math.round(glyph.advanceWidth * scale),
        path: scaledPath
    }));
  }
    // 保存转换后的字体
  return newFont;
}



function dealAllPages(pageItem, base64Map) {
  let pageRect = getRect(pageItem)
  let textObj = new TkSvg(pageItem, base64Map,pageRect.y)

  let pathObjectArr = textObj.pathObjectArr
    , textArr = []
    , lineArr = []
    , imageArr = []
    , tableArr = []


  // 循环文字对象，处理成text标签
  pathObjectArr.forEach((_t, index) => {
    if (_t.type === 'text') {  //文本
      const {x,y} = _t;
      _t.x = 0;
      _t.y= 0;
 
      if(["serif","simsun"].includes(_t.getFontFamily().toLocaleLowerCase()) && _t.fontStyle == "italic"){
        const newG =`<g transform="translate(${x},${y})"><g transform="skewX(-12)">${_t.getPath()}</g></g>`
        textArr.push(newG)
      }else{
        const newG =`<g transform="translate(${x},${y})">${_t.getPath()}</g>`
        textArr.push(newG)
      }
      
    } else if (_t.getType() == 'underlinewavy') {//波浪线
      lineArr.push(_t.getPath())
    }
    //竖线  横线
    else if (_t.getType() == 'line') {
      lineArr.push(_t.getPath())
    } else if (_t.getType() == 'polygon') {
      lineArr.push(_t.getPath())
    } else if (_t.getType() == 'image') {
      imageArr.push(_t.getPath())
    }  else if (_t.getType() == 'svg') {
      imageArr.push(_t.getPath())
    } else if (_t.getType() == 'table') {
      tableArr.push(_t.getPath())
    }

  })


  let svgC = `<svg width="${pageRect.width}px" height="${pageRect.height}px" viewBox="0 0 ${pageRect.width} ${pageRect.height}">
    <g id="tablegroup">
    ${tableArr.join('')}
    </g>
    <g id="textgroup">
      ${textArr.join('')}
    </g>
    <g id="linegroup">
    ${lineArr.join('')}
    </g>
    <g id="imagegroup">
    ${imageArr.join('')}
    </g>
  </svg>`
  $('.svg-con').append(svgC)
}


/**
 * 路径Object
 */
class PathObject {
  constructor(type = 'text', pageY) {
    this.type = type;
    this.pageY = pageY;
    this.fontWeight = 400
    return this;
  }

  //设置字体
  setFontFamily = (fontFamily = 'simsun') => {
    this.fontFamily = fontFamily.trim().replaceAll("\"", "").replaceAll("宋体", "simsun").replaceAll("serif", "simsun")
      .replaceAll("Songti SC", "simsun").replaceAll("仿宋", "simsun").replaceAll("楷体", "simkai").replaceAll("kaiti", "simkai");
    return this;
  }

  //设置字体
  setFontSize = (fontSize = '14px') => {
    this.fontSize = fontSize;
    return this;
  }
  //设置字体的粗细
  setFontWeight = (fontWeight = 400) => {
    this.fontWeight = fontWeight;
    return this;
  }
  setFontStyle = (fontStyle = 'normal') => {
    this.fontStyle = fontStyle
    return this
  }


  setValue = (value = '') => {
    this.value = value;
    return this;
  }

  setWidth = (width = 1) => {
    this.width = width;
    return this;
  }

  setHeight = (height = 1) => {
    this.height = height;
    return this;
  }

  setX = (...x) => {
    this.x = x;
    return this;
  }

  setY = (...y) => {
    this.y = y;
    for (let i = 0; i < this.y.length; i++) {
      this.y[i] = this.y[i] - this.pageY;
    }
    return this;
  }

  getX = (index) => {
    return this.x[index]
  }

  getY = (index) => {
    return this.y[index]
  }

  getFontSizeNumber = () => {
    return Number.parseFloat(this.fontSize.replace("px", ""))
  }

  getFontFamily() {
    //没有字体的默认字体
    if (!this.fontFamily) return 'simsun'

    let tempFontFamilyArr = this.fontFamily.split(',')
      , effectF = tempFontFamilyArr[0]

    //汉字,默认新罗马字体在前，宋体在后，或者是默认字体在后
    if (/^[\u4e00-\u9fa5]$/.test(this.value)) {
      effectF = tempFontFamilyArr[1] || tempFontFamilyArr[0] || 'simsun'
    } else if (/^[A-Za-z]+$/.test(this.value)) {
      effectF = tempFontFamilyArr[0] || 'times new roman'
    } else if (/^[0-9]+$/.test(this.value)) {
      effectF = tempFontFamilyArr[0] || 'times new roman'
    } else {
      effectF = tempFontFamilyArr[0] || 'simsun'
    }
    return effectF.trim()
  }

  getFontFamilys() {
    //没有字体的默认字体
    if (!this.fontFamily) return 'simsun'
    let tempFontFamilyArr = this.fontFamily.split(',')
    for (let i = 0; i < tempFontFamilyArr.length; i++) {
      tempFontFamilyArr[i] = tempFontFamilyArr[i].trim()
    }

    //补充一个宋体，默认最后，保证每个字体都能显示

    // tempFontFamilyArr[tempFontFamilyArr.length] = 'simsun'
    tempFontFamilyArr = tempFontFamilyArr.concat(['simsun','times new roman','simhei','ms mincho','simfang','simkai'])

    return tempFontFamilyArr
  }

  getValue = () => {
    return this.value;
  }

  getWidth = () => {
    return this.width;
  }

  getHeight = () => {
    return this.height;
  }

  getType = () => {
    return this.type;
  }

  getPath = () => {
    if (this.type === 'text') {  //文本
      let fontFamilys = this.getFontFamilys();
      let curVal = this.getValue()
      if(changeCharObj[curVal]) {
        curVal = changeCharObj[curVal]
      }
      for (let i = 0; i < fontFamilys.length; i++) {
        let fontFamily = fontFamilys[i].trim().toLocaleLowerCase()
        if (textToSvgData[fontFamily]) {
          const attributes = {};
          let options ={};
          if (this.fontWeight > 400) {
            attributes.stroke = "#000000"
            attributes["stroke-width"] = 0.22
            attributes['stroke-linecap'] = 'butt'
            attributes['stroke-linejoin'] = 'miter'
          }

          if (this.fontWeight=='bold') {
            //新罗马加粗
            if(fontFamily == 'times new roman') {
              fontFamily = 'times new roman bold'
            }
          }

          if (this.fontStyle == 'italic') {
            if(fontFamily == 'times new roman') {
              //新罗马常规斜体
              fontFamily = 'times new roman italic'
            }else if(fontFamily == "times new roman bold"){
              //新罗马加粗斜体
              fontFamily = 'times new roman italic bold'
            } else {
              // attributes['style'] = 'transform-box: content-box; transform: skew(-18deg); transform-origin: bottom;'
              attributes['style'] = 'transform-box: fill-box; transform: skew(-18deg) translate(-1px, 0); transform-origin: left;'
            }
          }

         
          options = {...{x: this.getX(0), y: this.getY(0), fontSize: this.getFontSizeNumber(), anchor: 'top', attributes: attributes },...options};
          const path = textToSvgData[fontFamily].getPath(curVal, options);
          if (path) {

            return path;
          }
        }
      }


      console.log("还没找到：", curVal, this.getFontFamily().toLocaleLowerCase())

      return '';
    } else if (this.getType() == 'underlinewavy') {//波浪线
      var currX = this.getX(0),
        currY = this.getY(0),
        wavy = 2.5,
        hWay = 2.5,
        width = this.getWidth(),
        length = Math.round(width / (wavy*2)),
        str = ''
      for (let i = 0; i < length; i++) {
        var tempHArr = [0+hWay, 0-hWay]
        str += `<path d="M${currX},${currY} Q${currX+=wavy},${currY+=tempHArr[i%2]} ${currX+=wavy},${currY}" stroke="black" stroke-width="1" fill="none" />`
      }
      return str;
    }
    //竖线  横线
    else if (this.getType() == 'line') {
      return `<path fill="none" stroke="#000000" d=" M ${this.getX(0)} ${this.getY(0)} L${this.getX(1)} ${this.getY(1)}"></path>`
    } else if (this.getType() == 'polygon') {
      return `<polygon points="${this.getX(0)},${this.getY(0)} ${this.getX(1)},${this.getY(1)} ${this.getX(2)},${this.getY(2)}" fill="black" />`
    } else if (this.getType() == 'image') {
      return `<image draggable="false" x="${this.getX(0)}" y="${this.getY(0)}" href="${this.getValue()}" width="${this.getWidth()}" height="${this.getHeight()}"></image>`
    } else if (this.getType() == 'table') {
      return `<foreignObject  width="${this.getWidth()}" height="${this.getHeight()}"  x="${this.getX(0)}" y="${this.getY(0)}">${this.getValue()} <body xmlns="http://www.w3.org/1999/xhtml"></body></foreignObject>`
    }
  }

}

class TkSvg {

  constructor(pageItem,base64Map, pageY) {
    this.pageItem = pageItem;
    this.pageY = pageY;
    this.base64Map = base64Map;
    this.pathObjectArr = [];
    this.prevLineRect = null
    this.prevWaveLineRect = []

    this.parseTextToObj(this,this.pageItem)
    this.prevWaveLineRect.forEach(_p => {
      this.drawUnderlinewavy(_p.startX, _p.y + _p.height, _p.endX - _p.startX)
    })
  }
  //画文字
  drawText(value, x, y, elParentStyleObj) {
    let pathObject = new PathObject('text', this.pageY);
    pathObject.setValue(value).setX(x).setY(y).setFontFamily(elParentStyleObj.fontFamily).setFontSize(elParentStyleObj.fontSize).setFontWeight(elParentStyleObj.fontWeight).setFontStyle(elParentStyleObj.fontStyle)
    this.pathObjectArr.push(pathObject);
  }

  //横线
  drawHLine(x, y, width) {
    let pathObject = new PathObject('line', this.pageY);
    pathObject.setX(x, x + width).setY(y, y)
    this.pathObjectArr.push(pathObject);
  }

  //画三角形
  drawPolygon(x, y, width, height) {
    let pathObject = new PathObject('polygon', this.pageY);
    pathObject.setX(x, x + width / 2, x + width).setY(y, y - height, y)
    this.pathObjectArr.push(pathObject);
  }

  // 波浪线
  drawUnderlinewavy(x, y, width) {
    let pathObject = new PathObject('underlinewavy', this.pageY);
    pathObject.setX(x).setY(y).setWidth(width)
    this.pathObjectArr.push(pathObject);
  }

  //图片
  drawImage(src, x, y, width, height) {
    let pathObject = new PathObject('image', this.pageY);
    pathObject.setValue(src).setX(x).setY(y).setWidth(width).setHeight(height)
    this.pathObjectArr.push(pathObject);
  }

  //svg图片
  drawSvg(src, x, y, width, height) {
    let pathObject = new PathObject('svg', this.pageY);
    pathObject.setValue(src).setX(x).setY(y).setWidth(width).setHeight(height)
    this.pathObjectArr.push(pathObject);
  }

  //表格
  drawTable(table, x, y, width, height) {
    let pathObject = new PathObject('table', this.pageY);
    pathObject.setValue(table).setX(x).setY(y).setWidth(width).setHeight(height)
    this.pathObjectArr.push(pathObject);
  }

   getTranslateFromMatrix(transform) {
    const matrix = new DOMMatrix(transform); // 自动解析矩阵
    return { x: matrix.m41, y: matrix.m42 }; // 或直接取 e、f
  }
  //获取位移
  getElementTranslate(element) {
    const style = window.getComputedStyle(element);
    const transform = style.transform;
  
    // 场景1：纯 translate
    if (transform.startsWith('translate')) {
      return getTranslateFromString(transform);
    }
  
    // 场景2：矩阵形式
    if (transform.startsWith('matrix')) {
      try {
        const matrix = new DOMMatrix(transform);
        return { x: matrix.m41, y: matrix.m42 };
      } catch (e) {
        const values = transform.match(/matrix$(.+)$/)[1].split(', ');
        return { x: parseFloat(values[4]), y: parseFloat(values[5]) };
      }
    }
  
    return { x: 0, y: 0 };
  }
  
  parseTextToObj = function (_self,el, isInTable) {
    if (el) {
      // 节点则判断是否有子级节点，有则继续循环子级节点
      if ([1].includes(el.nodeType)) {
        if (['INPUT'].includes(el.tagName)) {
          // // 特殊节点
          let elRange = getDomRangeRect(el);
          // _self.drawPolygon(elRange.x + elRange.width / 2 - 7, elRange.y + elRange.height - 5, 10, 10)
          // console.log(el)
          // let rect = getRangeRect(el, i, i + 1, text)
          if(el.value) {
            let elParentStyleObj = {
              // fontFamily: 'times new roman',
              fontWeight: '400',
              fontSize: '14px'
            }
            , xlen = 10
            if (el.value.length == 1) {
              xlen = 24
            } else if (el.value.length == 2) {
              xlen = 21
            } else if (el.value.length == 3) {
              xlen = 18
            } else if (el.value.length == 4) {
              xlen = 15
            } 
            console.log(xlen)
            _self.drawText(el.value, elRange.x+xlen, elRange.y, elParentStyleObj);
          }

          _self.drawHLine(elRange.x, elRange.y + elRange.height, elRange.width);
        }
        else if (['IMG'].includes(el.tagName)) {

          function isChineseChar(char) {
            return /^[\u4E00-\u9FA5\u3400-\u4DBF\uF900-\uFAFF\u{20000}-\u{2A6DF}]+$/u.test(char);
          }

          //svg中图片只能使用image标签，img不支持
          let elRange = getDomRangeRect(el);
          //处理svg,发现mathtype公式出现标签text文本，所以需要单独处理svg中的路径，
          //mathtype生成的，一部分是路径，一部分不是路径
          if(el.src.indexOf("data:image/svg+xml") == 0){
            //将图片进行base64解码
            let t = CryptoJS.enc.Base64.parse(el.src.replace("data:image/svg+xml;base64,",''));
            let svgHtml = t.toString(CryptoJS.enc.Utf8);
            //获取svg中的dom节点
            let svgDom = $(svgHtml);
            const svgTransConDom = $('#svgTransCon')
            svgTransConDom.html('')
            svgTransConDom.append(svgDom[0]); // 添加到DOM中以计算尺寸

            //查找文本
            let textDom = svgDom.find('text')
            //文本大于0，处理文字转曲
            if(textDom.length > 0){
              //父节点,主要是一个g（组）中有多个text，需要在下面进行位移
              let parentNode;
              let comParentCount = 0;//相同父节点的text数量

              for(let ti = 0; ti < textDom.length;ti++){
                let _text = textDom[ti]
                let tempParentNode = _text.parentNode;
                if(parentNode == tempParentNode){
                  comParentCount ++
                }else{
                  parentNode = _text.parentNode;
                  comParentCount = 0;
                }

                let _textContent = _text.textContent;
                //用于字符的偏移量
                let x = 0;
                for(let ci =0;ci <_textContent.length;ci++ ){
                  //留一个，主要是为了计算宽度,其他已经在上面保存
                  _text.innerHTML = _textContent[ci]
                  //获取字体大小,我看默认是884px,就按照这个大小渲染路径，svg自动缩放至大小
                  let fontSize = _text.attributes["font-size"]?.value;
                  //获取字体，现在发现是默认serif，所以新增了该字体
                    
                  let fontFamily = _text.attributes["font-family"]?.value;
                  let fontWeight =  _text.attributes["font-weight"]?.value;
                  let fontStyle = _text.attributes["font-style"]?.value;

                  if(!fontWeight){
                    fontWeight = _text.parentElement.style.fontWeight
                  }

                  //有的字体在g上
                  if(!fontFamily){
                    fontFamily = _text.parentElement.style.fontFamily
                  }
                  if(!fontStyle){
                    fontStyle = _text.parentElement.style.fontStyle
                  }

                  //字体设置位移
                  const tarnsData = _self.getElementTranslate(_text)
                  //替换g， scale(1,-1) ，默认字体翻转，故text的翻转去掉
                  const newGInnerHtml = _text.outerHTML.replace('text','g').replace("scale(1,-1)","").replace("matrix(1 0 0 -1 0 0)","");
                  let newG = $(newGInnerHtml);
                  newG.html('')

                  if(newG && ["serif","simsun"].includes(fontFamily) && fontStyle == "italic"){
                    newG.attr("transform",newG.attr("transform") + "skewX(12)")
                  }

                  let pathObject = new PathObject('text', 0);
                  pathObject.setValue(_textContent[ci])
                  .setX(x).setY(0)
                  .setFontFamily(fontFamily).setFontSize(fontSize)
                  .setFontWeight(fontWeight).setFontStyle(fontStyle)
                  let path = pathObject.getPath();
                  const $path = $(path)
                  var pathdom = document.createElementNS("http://www.w3.org/2000/svg", "path");
                  pathdom.setAttribute("d", $path.attr("d"));
                  //只有一个字不需要位移，因为g已经位移，只需要放入即可，多个text需要位移
                  //780是通过mathtype编辑后的文字他是经过翻转位移，780是我调整尝试出来，通过多层g的控制，很难计算
                  pathdom.setAttribute("transform", "translate(0,780) scale(1,-1)");
                  //加入到该g的位置
                  if(newG){
                    newG.append(pathdom)
                    _text.parentElement.append(newG[0])
                  }else{
                    _text.parentElement.append(pathdom)
                  }
                  //将字符宽度累加,用于下一个字符的开始 
                  x += _text.getComputedTextLength();
                }
              }
              //移除到原来的text，保留路径
              svgDom.find('text').remove();
            }
            //重新base64,并放入到img  src中
            let base64 = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(svgDom[0].outerHTML));
            base64 = `data:image/svg+xml;base64,${base64}`;
            _self.drawImage(base64, elRange.x, elRange.y, elRange.width, elRange.height)
            svgTransConDom.html('')
          }
          else if (el.src.indexOf("data:image") == -1) {
           
            let base64  = _self.base64Map[el.src]
            base64 = base64 && base64.replace("data:text/xml","data:image") || ''
            _self.drawImage(base64, elRange.x, elRange.y, elRange.width, elRange.height)
          }else{
            _self.drawImage(el.src, elRange.x, elRange.y, elRange.width, elRange.height)
          }
        }

        else if (['TABLE'].includes(el.tagName) && !isInTable) {

          var elRect = getDomRangeRect(el);
          let curTextY = elRect.top
            , curTextX = elRect.left;// + 3  3是边距
          if(el.caption) {
          //表头的宽高固定
          el.caption.style.width = $(el.caption).width() + "px"
          el.caption.style.height = $(el.caption).height() + "px"

          //表头
          var loopCaption = (cEl, fun) => {
            const captionChildNodes = cEl.childNodes;
            if (captionChildNodes.length > 0) {
              captionChildNodes.forEach(cEL => {
                if ([3].includes(cEL.nodeType)) {
                  fun(_self,cEL)
                } else {
                  loopCaption(cEL, fun);
                }
              })
            }
          }
          loopCaption(el.caption, this.processText);
          }


          let newEl = el.cloneNode(true)
          newEl.style.width = elRect.width + "px"

          let tds = $(el).find("td");
          let newElTds = $(newEl).find("td");
          newEl.style.fontFamily = 'Times New Roman, simsun';
          newEl.style.fontSize = '10.5pt'
          newEl.style.lineHeight = '18pt'
          newElTds.text('')

          for (let tdi = 0; tdi < newElTds.length; tdi++) {
            let td = tds[tdi];
            let newTd = newElTds[tdi];
            var tdRect = getDomRangeRect(td);
            newTd.style.width = tdRect.width + "px"
            newTd.style.height = tdRect.height + "px"
            _self.parseTextToObj(_self,td, true)
          }
          //情况表头的文字
          if(newEl.caption) {
          newEl.caption.innerText = ''
          }
          _self.drawTable(newEl.outerHTML, curTextX, curTextY, elRect.width, elRect.height);

        } else {
          if (el.childNodes.length > 0) {
            el.childNodes.forEach(cEL => {
              _self.parseTextToObj(_self,cEL, isInTable)
            })
          }
        }
      } else if ([3].includes(el.nodeType)) {
        _self.processText(_self,el)
      }
    }
  }

  processText(_self,el) {

    let elContent = el.textContent
      , elRect = getRect(el.parentNode)
      , _parent = $(el.parentNode)
      , elParentStyleObj = {
        fontFamily: _parent.css('fontFamily'),
        fontWeight: _parent.css('fontWeight'),
        fontSize: _parent.css('fontSize'),
        fontStyle: _parent.css('fontStyle')
      }

    if ((elContent.trim() == '' || elContent.trim() == '\n') && !_self.hasStyleOfParents(_parent, "text-decoration-line", "underline")) {
      return;
    }

    if (elContent.length > 0) {
      for (let i = 0; i < elContent.length; i++) {
        let text = elContent[i]

        let rect = getRangeRect(el, i, i + 1, text)
        _self.drawText(text, rect.x, rect.y, elParentStyleObj);

        //着重符号
        if (_parent.attr("class") == 'mce-emphatic_temp') {
          let currTextX = rect.x + rect.width / 2 - 2,
            curTextY = rect.y + 2
            elParentStyleObj['fontSize'] = '20px'
            _self.drawText(".", currTextX, curTextY, elParentStyleObj);
        }
        
        //波浪线  _parent.css("text-decoration") == "underline wavy rgb(0, 0, 0)"
        if (_self.hasStyleOfParents(_parent, "text-decoration", "underline wavy rgb(0, 0, 0)")) {
          let lastWaveLineObj = _self.prevWaveLineRect[_self.prevWaveLineRect.length - 1]
          if (!lastWaveLineObj || Math.abs(lastWaveLineObj.endX - rect.x) > 1 || Math.abs(lastWaveLineObj.y - rect.y) > 20) {
            _self.prevWaveLineRect.push({
              startX: rect.x,
              endX: rect.x + rect.width,
              height: rect.height,
              y: rect.y
            })
          } else if (lastWaveLineObj) {
            lastWaveLineObj['endX'] = rect.x + rect.width
          }
        } else if (_self.hasStyleOfParents(_parent, "text-decoration-line", "underline")) {
        // } else if (_parent.css("text-decoration-line") == "underline") {
        // } else if (_parent.css("text-decoration-line").indexOf('underline') >= 0 || _parent.css("text-decoration").indexOf('underline') >= 0) {
          if (_self.prevLineRect && Math.abs(_self.prevLineRect.y - rect.y) <= 10  && Math.abs(_self.prevLineRect.x+_self.prevLineRect.width - rect.x) <= 1) {
            _self.prevLineRect = {
              y: _self.prevLineRect.y
            }
          } else {
            _self.prevLineRect = {
              y: rect.y
            }
          }
          _self.prevLineRect['x'] = rect.x
          _self.prevLineRect['width'] = rect.width
          _self.drawHLine(_self.prevLineRect.x, _self.prevLineRect.y + 15 , _self.prevLineRect.width)
        } else if (_self.hasStyleOfParents(_parent, "text-decoration-line", "line-through")) {
          // } else if (_parent.css("text-decoration-line") == "underline") {
          // } else if (_parent.css("text-decoration-line").indexOf('underline') >= 0 || _parent.css("text-decoration").indexOf('underline') >= 0) {
            if (_self.prevLineRect && Math.abs(_self.prevLineRect.y - rect.y) <= 10  && Math.abs(_self.prevLineRect.x+_self.prevLineRect.width - rect.x) <= 1) {
              _self.prevLineRect = {
                y: _self.prevLineRect.y
              }
            } else {
              _self.prevLineRect = {
                y: rect.y
              }
            }
            _self.prevLineRect['x'] = rect.x
            _self.prevLineRect['width'] = rect.width
            _self.drawHLine(_self.prevLineRect.x, _self.prevLineRect.y + 7 , _self.prevLineRect.width)
          }
      }
    }
  }

  hasStyleOfParents(_parent, cssName, cssValue) {
    if (_parent.hasClass('block-item') || _parent.hasClass('nop-page-pendants') || _parent.hasClass('nop-page-content') || _parent.hasClass('nop-page-item')) {
      return false
    } else if (_parent.css(cssName) === cssValue) {
      return true
    } else {
      return this.hasStyleOfParents(_parent.parent(), cssName, cssValue)
    }
  }
}



var sel = window.getSelection();
//获取dom的坐标
function getDomRangeRect(el) {
  var range = document.createRange();  // 创建文本区域对象
  range.selectNode(el)
  sel.removeAllRanges();
  sel.addRange(range);

  let clientRect = range.getBoundingClientRect();
  clientRect = Object.assign(clientRect, {})
  return clientRect;
}

// 获取文字的宽度
function getRangeRect (el, start, end) {
  var range = document.createRange();  // 创建文本区域对象
  range.setStart(el, start);
  range.setEnd(el, end);
  // range.collapse(true);//是否闭合
  sel.removeAllRanges();
  sel.addRange(range);

  let clientRect = range.getBoundingClientRect();
  clientRect = Object.assign(clientRect, {})
  return clientRect;
}


function getRect(dom) {
  if (!dom) return {};

  var _dom = dom.length ? dom[0] : dom;
  var _rect = _dom.getBoundingClientRect && _dom.getBoundingClientRect();
  return Object.assign(_rect, { dom: _dom });
}

