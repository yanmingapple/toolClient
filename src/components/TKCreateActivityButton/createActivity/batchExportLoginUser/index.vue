<template>
  <div class="batchExportLoginUser">
    <div style="display: flex; justify-content: end">
      <div>
        <el-button :disabled="isPrinting" type="primary" @click="handlerPrintTable">打印</el-button>
        <el-button :disabled="isPrinting" type="primary" @click="handlerExportTable">导出</el-button>
      </div>
    </div>
    <el-tabs v-model="editableTabsValue">
      <el-tab-pane label="按活动分类" name="actUserTab" id="actUserTableContainer">
        <div class="tkCusTableContainer">
          <!-- 按活动分类 -->
          <table border id="actUserTable" class="tkCusTable">
            <!-- 表头 -->
            <thead class="tkCusTable_header">
              <tr>
                <th>活动名称</th>
                <th>活动类型</th>
                <th>教师名称</th>
                <th>登陆名称</th>
                <th>密码</th>
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

                    <template v-for="(user, userIndex) in _activity.userList" :key="userIndex">
                      <td>
                        <span>{{ user.userName }}</span>
                      </td>
                      <td>
                        {{ user.loginUserName }}
                      </td>
                      <td>
                        {{ user.loginPwd }}
                      </td>
                    </template>
                  </tr>
                </template>

                <template v-else>
                  <tr>
                    <td :rowspan="_activity.userList.length + 1">
                      {{ _activity.activityName }}
                    </td>
                    <td :rowspan="_activity.userList.length + 1">
                      {{ _activity.activityTypeName }}
                    </td>
                  </tr>

                  <template v-for="(user, userIndex) in _activity.userList" :key="userIndex">
                    <tr :class="{ grayBg: userIndex % 2 }">
                      <td>
                        <span>{{ user.userName }}</span>
                      </td>
                      <td>
                        {{ user.loginUserName }}
                      </td>
                      <td>
                        {{ user.loginPwd }}
                      </td>
                    </tr>
                  </template>
                </template>
              </template>
            </tbody>
          </table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="按用户分类" name="userListTab" id="userListTableContainer">
        <!-- 用户形式 -->
        <div class="tkCusTableContainer">
          <table border id="userListTable" class="tkCusTable">
            <!-- 表头 -->
            <thead class="tkCusTable_header">
              <tr>
                <th>教师名称</th>
                <th>登陆名称</th>
                <th>密码</th>
              </tr>
            </thead>
            <tbody class="tkCusTable_body">
              <tr v-for="(user, _userIndex) in loginUserList" :key="_userIndex" :class="{ grayBg: _userIndex % 2 }">
                <td>
                  <span>{{ user.name }}</span>
                </td>
                <td>
                  {{ user.userName }}
                </td>
                <td>
                  {{ user.password }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <tk-table-print ref="tkTablePrintRef"></tk-table-print>
  </div>
</template>

<script setup>
import tkTools from "@/utils/tkTools";
import { reactive, ref, onMounted, computed, nextTick } from "vue";

const editableTabsValue = ref("actUserTab");
const loginUserList = ref([]);
const groupUserList = ref();
const isPrinting = ref(false);
const tkTablePrintRef = ref(null);
function handlerExportTable() {
  const targetId = editableTabsValue.value == "actUserTab" ? "actUserTable" : "userListTable";
  tkTools.exportElTbl(targetId, "用户列表");
}
function handlerPrintTable() {
  if (isPrinting.value) return;

  isPrinting.value = true;

  // 使用 setTimeout 让 Vue 更新完界面后再执行打印
  setTimeout(() => {
    try {
      const targetId = editableTabsValue.value == "actUserTab" ? "actUserTableContainer" : "userListTableContainer";
      tkTablePrintRef.value.doComInit(document.getElementById(targetId).innerHTML, true);
      isPrinting.value = false;
    } catch (e) {
      isPrinting.value = false;
      console.log("🚀 ~ handlerPrintTable ~ e:", e);
    }
  }, 0); // 延迟 0ms 即可让事件循环先更新 DOM
}
const doComInit = (paramGroupUserList, paramLoginUserList) => {
  groupUserList.value = paramGroupUserList;
  loginUserList.value = [];

  const userMap = {};
  const actUserMap = {};
  paramLoginUserList.forEach((_el) => {
    if (!actUserMap[_el.activityName]) {
      actUserMap[_el.activityName] = {};
    }
    actUserMap[_el.activityName][_el.name] = _el;

    if (!userMap[_el.name]) {
      userMap[_el.name] = _el;
      loginUserList.value.push(_el);
    }
  });

  groupUserList.value.forEach((_act) => {
    _act.userList.forEach((_user) => {
      if (actUserMap[_act.activityName] && actUserMap[_act.activityName][_user.userName]) {
        const loginUser = actUserMap[_act.activityName][_user.userName];
        _user.loginUserName = loginUser.userName;
        _user.loginPwd = loginUser.password;
      }
    });
  });
};

defineExpose({ doComInit });
</script>
<style lang="less" scoped>
.batchExportLoginUser {
  margin: 10px 20px 0 20px;
  box-sizing: border-box;
  .tkCusTableContainer {
    height: calc(100vh - 370px);
    margin: 0;
  }
}
</style>
