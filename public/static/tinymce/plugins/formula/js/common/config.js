/**
 * @Copyright Copyright © 2021
 * @Createdon 2022-5-26
 * @Author Panda_YueTao
 * @Version 1.6.4
 * @Title 妈叔出品-LaTeX公式编辑器配置
 */

const Environment = "release";
// const Environment = "development";

const Config = {
  // development: {
  //   Version: "开发版" + new Date().getTime(),
  //   MainJS: {
  //     latex: "/publish/latex.bundle.min.js",
  //     readme: "/publish/readme.bundle.min.js",
  //     update: "/publish/update.bundle.min.js",
  //     messageboard: "/publish/messageboard.bundle.min.js",
  //     login: "/publish/login.bundle.min.js",
  //     personal: "/publish/personal.bundle.min.js",
  //   },
  //   Boot_OSS: "",
  //   WebAPI: {
  //     Root: "https://www.latexlive.com:5002/api/",
  //     // Root: "http://192.168.1.105:5001/api/",
  //     // Root: "http://localhost:5000/api/",
  //     Controller: {
  //       GetLaTexFromMathPix: "Mathpix/GetLaTexFromMathPix",
  //       LoginByMyToken: "Client/LoginByMyToken",
  //       LoginByAccount: "Client/LoginByAccount",
  //       RegByAccount: "Client/RegByAccount",
  //       UpdateUser: "Client/UpdateUser",
  //       DeleteUser: "Client/DeleteUser",
  //       LoginByWX: "Client/LoginByWX",
  //       WXBind: "Client/WXBind",
  //       LoginByMessage: "Client/LoginByMessage",
  //       SendMessageCode_Identity: "Client/SendMessageCode_Identity",
  //       SendMessageCode_Login: "Client/SendMessageCode_Login",
  //       GetRemainTime: "Client/GetRemainTime",
  //     },
  //   },
  //   Hostname: "192.168.1.105",
  //   WXLogin: {
  //     AppID: "wx44c76601e54d4674",
  //     RedirectURL: "https://www.latexlive.com",
  //   },
  // },
  
  release: {
    
    MainJS: {
      latex: "/publish/latex.bundle.min.js",
      readme: "/publish/readme.bundle.min.js",
      update: "/publish/update.bundle.min.js",
      messageboard: "/publish/messageboard.bundle.min.js",
      login: "/publish/login.bundle.min.js",
      personal: "/publish/personal.bundle.min.js",
    },
    Boot_OSS: "oss",
    WebAPI: {
      Root: "",
      Controller: {
        GetLaTexFromMathPix: "Mathpix/GetLaTexFromMathPix",
        LoginByMyToken: "Client/LoginByMyToken",
        LoginByAccount: "Client/LoginByAccount",
        RegByAccount: "Client/RegByAccount",
        UpdateUser: "Client/UpdateUser",
        DeleteUser: "Client/DeleteUser",
        LoginByWX: "Client/LoginByWX",
        WXBind: "Client/WXBind",
        LoginByMessage: "Client/LoginByMessage",
        SendMessageCode_Identity: "Client/SendMessageCode_Identity",
        SendMessageCode_Login: "Client/SendMessageCode_Login",
        GetRemainTime: "Client/GetRemainTime",
      },
    },
    Hostname: "",
    WXLogin: {
      AppID: "wx44c76601e54d4674",
      RedirectURL: "",
    },
  },
};
