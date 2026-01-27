import { getAcitivityRolesList, getRolesList } from "@/store/tkStore";
// 系统角色
// 活动角色
// 控制按钮的显示和隐藏
import { SET_ROLES } from "@/store/tkStore";
/**
 *
 * @param {*} el dom
 * @param {*} binding v-role=['admin']
 *
 *  1. roles 系统 角色数组
 *  2. activityRoles 活动角色 数组
 */
import { tkTransferParamsData } from "@/global/tkTransferParamsData.js";

const hasPermission = async (el, binding) => {
  const actData = tkTransferParamsData("/activity/activityDetail");
  const permissionRoles = binding;
  if (permissionRoles && permissionRoles instanceof Array) {
    if (permissionRoles.length > 0) {
      setTimeout(async () => {
        // 获取系统
        const roles = getRolesList();
        //   无角色时重新请求获取
        if (roles.value.length === 0) {
          // 获取用户信息以及角色列表 -> 是否显示左边部门显示
          const { ret } = await tkReq().path("getUserInfo").send();
          SET_ROLES(ret.roles);
          // roleType 0.管理员 1.系统管理员 2.业务员 4.活动人员
        }
        const activityRoles = getAcitivityRolesList();
        let hasFinalRole = false; //最终有无权限

        for (var pIndex = 0; pIndex < permissionRoles.length; pIndex++) {
          //如果最后有权限，直接跳过
          if (hasFinalRole) break;

          const { roleType, permissionType, activityRole } = permissionRoles[pIndex];
          //如果有权限
          const hasRole = roles.value.some((role) => {
            return roleType == role.type;
          });
          //无权限找下一个
          if (!hasRole) {
            continue;
          }
          //permissionType 权限类型是所有 all 直接不用继续找了，有权限
          if (permissionType == "all") {
            hasFinalRole = true;
            break;
          }

          // 如果只有部分权限，需要看活动多个角色activityRole
          if (permissionType == "some" && activityRole) {
            if (activityRole.length > 0) {
              const hasActivityRole = activityRoles.value.some((role) => {
                return activityRole.includes(role.roleValue);
              });

              if (hasActivityRole) {
                hasFinalRole = true;
                break;
              }
            }
          }
        }
        if (!hasFinalRole) {
          // el && el.parentNode && el.parentNode?.removeChild(el);
          el && el?.remove();
        }

        //   // 业务管理员显示所有按钮
        //   if (roles.value.find((role) => role.type == "0")) {
        //   } else {
        //     const hasRole = roles.value.some((role) => {
        //       return permissionRoles.includes("ROLE_" + role.type);
        //     });

        //     let hasActivityRole = true;
        //     if (actData.id || actData.actid) {
        //       if (activityRoles.value.find((role) => role.roleValue == "0")) {
        //         hasActivityRole = true;
        //         return;
        //       }

        //       hasActivityRole = activityRoles.value.some((role) => {
        //         return permissionRoles.includes("ACTIVITYROLE_" + role.roleValue);
        //       });
        //     }
        //     if (!hasActivityRole || !hasRole) {
        //       // el && el.parentNode && el.parentNode?.removeChild(el);
        //       el && el?.remove();
        //     }
        //   }
      }, 400);
    }
  } else if (permissionRoles && permissionRoles instanceof Object) {
    //roleType 0.管理员 1.系统管理员 2.业务员 4.活动人员
    //轮训权限角色
    for (var perKey in permissionRoles) {
      const { roleType, activityRoles, buttonsRoles } = permissionRoles[perKey];
      const hasRole = roles.value.some((role) => {
        return roleType == role.type;
      });
    }
  } else {
    throw new Error(`need roles! Like v-permission="['admin','editor']"`);
  }
};

export default {
  //如果app.use()中的插件是一个对象，必须提供 install 方法。如果插件是一个函数，它会被作为 install 方法。
  //install 方法调用时，会将 app 作为参数传入,此时就可以在别的文件中使用app.directive()了
  install(app) {
    app.directive("permission", {
      //指令的钩子会传递2个参数
      //el:指令绑定到的元素,这可以用于直接操作 DOM
      //binding.value：传递给指令的值
      mounted(el, binding) {
        hasPermission(el, binding.value);
      },
    });
  },
};
