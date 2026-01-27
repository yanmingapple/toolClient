<template>
  <div class="tkCusTableContainer">
    <table class="tkCusTable" border>
      <!-- 表头 -->
      <thead class="tkCusTable_header">
        <tr>
          <th style="width: 11%">活动名称</th>
          <th style="width: 11%">活动类型</th>
          <th style="width: 11%">角色设置</th>
          <th style="width: 11%">教师名称</th>
          <th style="width: 56%">教师角色</th>
        </tr>
      </thead>

      <tbody class="tkCusTable_body">
        <template v-for="(_activity, _activityIndex) in groupUserList" :key="_activityIndex">
          <template v-if="_activity.userList.length == 1">
            <tr>
              <td>
                {{ _activity.activityName }}
              </td>

              <td>
                {{ _activity.activityTypeName }}
              </td>

              <td class="mr0">
                <div class="roleSet">
                  <!-- <el-checkbox-group
                    v-model="_activity.role"
                    @change="
                      (v) => {
                        handlerChangeGroupUserRole(v, _activity.userList);
                      }
                    "
                  >
                    <el-checkbox
                      v-for="(_role, _roleIndex) in _activity.roleList"
                      :key="'act_' + _activity.activityName + '_' + _roleIndex"
                      :label="_role.roleName"
                      :value="_role.roleValue"
                    >
                      {{ _role.roleName }}(全选)
                    </el-checkbox>
                  </el-checkbox-group> -->

                  <!-- 使用单选组替代开关 -->
                  <el-radio-group :model-value="_activity.selectedRole" @update:model-value="val => handleActivityRoleRadioChange(val, _activity)">
                    <el-radio v-for="(_role, _roleIndex) in _activity.roleList" :key="'act_' + _activity.activityName + '_' + _roleIndex" :label="_role.roleValue">
                      {{ _role.roleName }}
                    </el-radio>
                  </el-radio-group>
                </div>
              </td>

              <template v-for="(user, userIndex) in _activity.userList" :key="userIndex">
                <td>
                  <span>{{ user.userName }}</span>
                </td>
                <!--活动与角色-->
                <td>
                  <!-- <el-checkbox-group v-model="user.role">
                    <el-checkbox
                      v-for="(_role, _roleIndex) in user.roleList"
                      :key="'user_' + _role.roleValue + '_' + _roleIndex"
                      :label="_role.roleName"
                      :value="_role.roleValue"
                    >
                      {{ _role.roleName }}
                    </el-checkbox>
                  </el-checkbox-group> -->

                  <el-radio-group :model-value="user.selectedRole" @update:model-value="val => handleUserRoleRadioChange(val, user)">
                    <el-radio v-for="(_role, _roleIndex) in user.roleList" :key="'user_' + _role.roleValue + '_' + _roleIndex" :label="_role.roleValue">
                      {{ _role.roleName }}
                    </el-radio>
                  </el-radio-group>
                </td>
              </template>
            </tr>
          </template>

          <template v-else>
            <tr>
              <!-- 活动名称 -->
              <td :rowspan="_activity.userList.length + 1">
                {{ _activity.activityName }}
              </td>
              <!-- 活动类型 -->
              <td :rowspan="_activity.userList.length + 1">
                {{ _activity.activityTypeName }}
              </td>

              <!-- 角色设置 -->
              <td :rowspan="_activity.userList.length + 1" class="mr0">
                <div class="roleSet">

                  <!-- 使用单选组替代开关 -->
                  <el-radio-group :model-value="_activity.selectedRole" @update:model-value="val => handleActivityRoleRadioChange(val, _activity)">
                    <el-radio v-for="(_role, _roleIndex) in _activity.roleList" :key="'act_' + _activity.activityName + '_' + _roleIndex" :label="_role.roleValue">
                      {{ _role.roleName }}
                    </el-radio>
                  </el-radio-group>
                  <!-- <el-checkbox-group
                    v-model="_activity.role"
                    @change="
                      (v) => {
                        handlerChangeGroupUserRole(v, _activity.userList);
                      }
                    "
                  >
                    <el-checkbox
                      v-for="(_role, _roleIndex) in _activity.roleList"
                      :key="'act_' + _activity.activityName + '_' + _roleIndex"
                      :label="_role.roleName"
                      :value="_role.roleValue"
                    >
                      {{ _role.roleName }}(全选)
                    </el-checkbox>
                  </el-checkbox-group> -->
                </div>
              </td>
            </tr>

            <template v-for="(user, userIndex) in _activity.userList" :key="userIndex">
              <tr :class="{ grayBg: userIndex % 2 }">
                <!-- 教师名称 -->
                <td>
                  <span>{{ user.userName }}</span>
                </td>
                <!--教师角色-->
                <td>
                  <!-- <el-checkbox-group v-model="user.role">
                    <el-checkbox
                      v-for="(_role, _roleIndex) in user.roleList"
                      :key="'user_' + _role.roleValue + '_' + _roleIndex"
                      :label="_role.roleName"
                      :value="_role.roleValue"
                    >
                      {{ _role.roleName }}
                    </el-checkbox>
                  </el-checkbox-group> -->

                  <el-radio-group :model-value="user.selectedRole" @update:model-value="val => handleUserRoleRadioChange(val, user)">
                    <el-radio v-for="(_role, _roleIndex) in user.roleList" :key="'user_' + _role.roleValue + '_' + _roleIndex" :label="_role.roleValue">
                      {{ _role.roleName }}
                    </el-radio>
                  </el-radio-group>
                </td>
              </tr>
            </template>
          </template>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, computed, nextTick } from 'vue';

//活动列表
const activityList = ref();
//用户列表
const userList = ref();
//分组后的活动列表
const groupActivityList = ref({});

//分组后的用户列表
const groupUserList = ref([]);
//用户角色组
const groupActivityRole = ref({});

//改变用户组角色
function handlerChangeGroupUserRole(_v, _userList) {
  _userList.forEach(_el => {
    _el.role = _v;
  });
}

function handlerChangeGroupUserAct(groupUser, activityValue) {
  const userList = groupUser.userList;
  const selectAct = groupUser.selectAct[activityValue];
  userList.forEach(_el => {
    _el.selectAct[activityValue] = selectAct;
  });
}
// 处理活动角色单选变化
function handleActivityRoleRadioChange(value, activity) {
  // 设置活动的选中角色
  activity.selectedRole = value;

  // 更新原有 role 数组
  activity.role = value ? [value] : [];

  if (value) {
    // 自动选中该活动下所有用户的 selectedRole
    activity.userList.forEach(user => {
      // 检查用户的角色列表中是否包含当前角色
      const hasRole = user.roleList && user.roleList.some(r => r.roleValue === value);
      if (hasRole) {
        // 设置用户的选中角色为当前角色
        user.selectedRole = value;
        // 同步更新 user.role 数组
        user.role = [value]; // 单选，只保留一个值
      }
    });
  } else {
    // 清空所有用户的选中状态（如果他们当前选中的是该角色）
    activity.userList.forEach(user => {
      if (activity.role.includes(user.selectedRole)) {
        user.selectedRole = '';
        user.role = [];
      }
    });
  }

  // 同步更新用户角色
  handlerChangeGroupUserRole(activity.role, activity.userList);
}

// 处理用户角色单选变化
function handleUserRoleRadioChange(value, user) {
  // 更新单选值
  user.selectedRole = value;

  // 同步更新原有的 role 数组
  user.role = value ? [value] : [];
}

// 查询所有命题活动的教师角色列表
function queryAllActivityRole(callBack) {
  tkReq()
    .path('queryAllActivityRole')
    .succ(res => {
      // 分组显示活动类型数据
      const activityTypeData = tkTools.groupBy(res.ret, 'activityType');
      // 获取活动类型枚举
      const actTypeList = tkEnumData.ALL_ACTTYPE_LIST_TYPE;

      // 获取activityTyp命题类型下的角色列表作为教师角色的选项
      actTypeList.forEach(actType => {
        const actName = actType.label;
        const actValue = actType.value;
        groupActivityRole.value[actName] = activityTypeData[actValue];
      });

      // groupActivityRole.value = 返回键值对 {'命题活动':{ activityType: "1", roleName: "命题教师" ,roleValue: "4" }}
      callBack();
    })
    .send();
}

const doComInit = (paramsActivityList, paramsUserList, paramGroupUserList) => {
  queryAllActivityRole(() => {
    activityList.value = paramsActivityList;
    userList.value = paramsUserList;

    //用户分组赋值，分组后设置活动角色是否全选
    groupUserList.value = [];

    //按照活动名称分组
    const activityData = tkTools.groupBy(paramsActivityList, 'name');
    const activityUserGroup = tkTools.groupBy(paramsUserList, 'activityName');
    const oldActivityUserGroup = paramGroupUserList
      ? tkTools.groupBy(paramGroupUserList, 'activityName')
      : {};
    for (var activityKey in activityUserGroup) {
      let userGroupData = activityUserGroup[activityKey];
      //缓存的分组信息
      let catchData = oldActivityUserGroup[activityKey];
      catchData = catchData ? catchData[0] : {};

      //用户对应活动的角色选择赋值
      userGroupData.forEach(_user => {
        //缓存用户
        let _cashUserData = catchData?.userList?.find(
          _cachUser => _cachUser.userIdCard == _user.userIdCard
        );

        _user.roleList = groupActivityRole.value[userGroupData[0].activityTypeName]; //活动角色列表
        _user.role = _cashUserData?.role ?? []; //_user.roleList.map(_el=>_el.roleValue);

        // 新增单选字段，与原 role 数组同步
        _user.selectedRole = _user.role.length > 0 ? _user.role[0] : '';
      });

      //当前行数据
      const _rowData = {
        ...activityData[activityKey][0],
        activityName: activityKey, //活动名称
        activityTypeName: userGroupData[0].activityTypeName, //活动类型名称
        roleList: groupActivityRole.value[userGroupData[0].activityTypeName], //活动角色列表
        userList: userGroupData, //用户列表
        role: catchData?.role ?? [], //选择的角色列表
        // 使用 selectedRole 字段来存储当前选中的角色
        selectedRole:
          catchData?.role && catchData.role.length > 0 ? catchData.role[0] : '',
      };

      groupUserList.value.push(_rowData);
    }
  });
};

function doSubmit() {
  const ret = {
    succ: true,
    data: groupUserList.value,
    tipList: [],
  };

  let notificationDataList = [];

  groupUserList.value.forEach(_activity => {
    const userList = _activity.userList;
    //专家设置活动后，是否设置角色
    userList.forEach(_user => {
      if (_user.role.length == 0) {
        notificationDataList.push({
          msg: `${_user.userName}(${_activity.activityName}) <span style="color: red;">未设置角色</span>`,
        });
      }
    });
  });

  if (notificationDataList.length > 0) {
    ret.succ = false;
    ret.tipList = notificationDataList;
  }
  return ret;
}

function doSubmitTemp() {
  const ret = {
    succ: true,
    data: groupUserList.value,
    tipList: [],
  };
  return ret;
}

defineExpose({ doComInit, doSubmit, doSubmitTemp });
</script>

<style lang="less" scoped>
.tkCusTableContainer {
  height: calc(100vh - 260px);
  td:not(.roleSet) {
    > :deep(.el-radio-group) {
      display: flex;
      flex-wrap: wrap;
      // 默认居中对齐
      justify-content: center;
      // 或者根据子元素数量判断
      &:has(.el-radio:nth-child(n + 5)) {
        justify-content: flex-start;
      }
    }
  }
  .roleSet {
    > :deep(.el-radio-group) {
      display: flex;
      .el-radio {
        padding-left: 2rem;
        width: 100%;
        box-sizing: border-box;
      }
    }
  }
}
</style>
