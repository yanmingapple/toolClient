import CryptoJS from "crypto-js";
import pako from 'pako'
import { Base64 } from "js-base64";

var KEY = "hyt-tk-123456789";
(function () {
  var functionObj = {
    //转日期对象
    tkDate: function () {
      let value = this.toString();
      if (value) {
        if (isNaN(Number(value, 10)))
          return new Date(Date.parse(value.replace(/-/g, "/")));

        return new Date(Number.parseFloat(value));
      }

      return null;
    },
    //转日期格式化，可指定格式
    //月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q)
    tkDateStringFormart: function (formart) {
      return this.tkDate().format(formart || "yyyy-MM-dd HH:mm:ss");
    },
    //截取字符串，多出的以...显示
    tkCutstr: function (len) {
      let value = this.toString();
      var temp;
      var icount = 0;
      var patrn = /[^\x00-\xff]/;
      var strre = "";
      for (var i = 0; i < value.length; i++) {
        if (icount < len - 1) {
          temp = value.substr(i, 1);
          if (patrn.exec(temp) == null) {
            icount = icount + 1;
          } else {
            icount = icount + 2;
          }
          strre += temp;
        } else {
          break;
        }
      }
      return strre + "...";
    },
    //转码
    tkEnCodeV1:function(str){
      if(str){
          return encodeURIComponent(str);
      }
      return encodeURIComponent(this.toString());
  },
  //解码
  tkDecodeV1:function(str){
      if(str){
          return decodeURIComponent(str);
      }
      return decodeURIComponent(this.toString());
  },
    //转码
    tkEnCode:function(str){
      if(str){
          return encodeURIComponent(str);
      }
      return encodeURIComponent(this.toString());
  },
  //解码
  tkDecode:function(str){
      if(str){
          return decodeURIComponent(str);
      }
      return decodeURIComponent(this.toString());
  },
    //转base64
    tkEncodeBase64: function () {
      return encodeURIComponent(Base64.encode(this.toString()));
    },
    //base64解码
    tkDecodeBase64: function () {
      return Base64.decode(decodeURIComponent(this.toString()));
    },
    /* *
     *  加密
     */
    tkEncrypt: function () {
      //加密算法先使用base64
      return this.tkEncodeBase64();
      // console.log( " 原始长度： "   +  this.toString().length ,this.toString());
      // var strNormalString = this.tkEncodeBase64();
      // console.log( "base64长度： "   +  strNormalString.length);
      // var srcs = CryptoJS.enc.Utf8.parse(strNormalString) //  字符串到数组转换，解析明文
      // var key = CryptoJS.enc.Utf8.parse(KEY) //  字符串到数组转换，解析秘钥
      // // mode:加密方式；padding:填充方式；iv便宜向量（可选）
      // var encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 })
      // var strCompressedString = encrypted.toString() // 加密后的结果是对象，要转换为文本
      // console.log("压缩后长度： "   +  strCompressedString.length);
      // return  strCompressedString;
    },

    /* *
     * 解密
     */
    tkDecrypt: function () {
      //加密算法先使用base64
      return this.tkDecodeBase64();
      // var key = CryptoJS.enc.Utf8.parse(KEY) //  字符串到数组转换
      // var decrypt = CryptoJS.AES.decrypt(this.toString(), key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 })
      // var strData = CryptoJS.enc.Utf8.stringify(decrypt).toString() //  数组到字符串转换
      // // strData = strData.tkDecodeBase64()
      // console.log(" 解密后： "   +  strData);
      // return strData;
    },
    //aes 加密
    tkEncryptAes:function(password){
      return CryptoJS.AES.encrypt(this.toString(),  CryptoJS.enc.Utf8.parse(password), { mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    },
    //aes 解密
    tkDecryptAes:function(password){
      return CryptoJS.AES.decrypt(this.toString(), CryptoJS.enc.Utf8.parse(password));
    },
    //des 加密
    tkEncryptDes:function(password){
      return CryptoJS.DES.encrypt(this.toString(),  CryptoJS.enc.Utf8.parse(password));
    },
    //des 解密
    tkDecryptDes:function(password){
      return CryptoJS.DES.decrypt(this.toString(), CryptoJS.enc.Utf8.parse(password));
    },
    //rc4 加密
    tkEncryptRc4:function(password){
      return CryptoJS.RC4.encrypt(this.toString(),  CryptoJS.enc.Utf8.parse(password));
    },
    //rc4 解密
    tkDecryptRc4:function(password){
      return CryptoJS.DES.decrypt(this.toString(), CryptoJS.enc.Utf8.parse(password));  
    },
     //Rabbit 加密  
     tkEncryptRabbit:function(password){
      return CryptoJS.Rabbit.encrypt(this.toString(),  CryptoJS.enc.Utf8.parse(password));
     },
     //Rabbit 解密
     tkDecryptRabbit:function(password){
      return CryptoJS.Rabbit.decrypt(this.toString(), CryptoJS.enc.Utf8.parse(password));  
     },
      //TripleDes 加密
      tkEncryptTripleDes:function(password){
        return CryptoJS.TripleDES.encrypt(this.toString(),  CryptoJS.enc.Utf8.parse(password));
      },
      //TripleDes 解密
      tkDecryptTripleDes:function(password){
        return CryptoJS.TripleDES.decrypt(this.toString(), CryptoJS.enc.Utf8.parse(password));  
      },
    /* *
     * 转json
     */
    tkJson: function () {
      try{
        return JSON.parse(this.toString());
      }catch(e){
        return {};
      }
      
    },

    /* *
     * Md5加密
     */
    tkMd5:function(){
      return  CryptoJS.MD5(this.toString());
    },
    
    /* *
     * SHA1
     */
    tkSha1:function(){
      return  CryptoJS.SHA1(this.toString());
    },
       
    /* *
     * SHA256
     */
    tkSha256:function(){
      return  CryptoJS.SHA256(this.toString());
    },

           
    /* *
     * SHA512
     */
    tkSha512:function(){
      return  CryptoJS.SHA512(this.toString());
    },
     /* *
     * SHA3
     */
     tkSha3:function(length){
      //支持 512 384 256 224
      if(!length) length = 512
      return  CryptoJS.SHA3(this.toString(),{ outputLength: length });
    },

    /* *
     * SHA3
     */
    tkRipemd:function(){
      return  CryptoJS.RIPEMD160(this.toString());
    },
    /* *
     * 压缩
     */
    tkCompress:function(){
      return pako.deflate(this.toString(), {to: "string"});
    },
    /* *
     * 解压缩
     */
    tkDecompress:function(){
      return pako.inflate(this.toString());
    },
    /* *
     * 解压缩
     */
    tkUngzip:function(){
      return pako.ungzip(this.toString());
    },
    /* *
     * 压缩
     */
    tkGzip:function(){
      return pako.gzip(this.toString(), {to: "string"});
    },
  };

  var extend = function (org, target) {
    for (var item in target) {
      org.prototype[item] = target[item];
    }
  };

  extend(String, functionObj);
})();

// console.log('2022-02-03 12:30:30'.tkDate());
// console.log('2022-02-03 12:30:30'.tkDateStringFormart("yyyy-MM-dd EEE"));
// console.log("穷还爱神的箭稍等了萨达".tkEncodeBase64());
