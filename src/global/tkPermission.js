

(function () {
  "use strict";
  class tkPermissionData {
      add (key, dataArray) {
          this[key] = dataArray;
      }
  }

  //0.管理员 1.系统管理员 2.业务员 4.活动人员
 const  TkPermissionData =   new tkPermissionData()

  module.exports = TkPermissionData;

  TkPermissionData.add("workbench", [
    {
    roleType:0,//角色类型
    permissionType:"all",//权限控制类型  all 所有权限  some 一部分
    }
]);

})();
