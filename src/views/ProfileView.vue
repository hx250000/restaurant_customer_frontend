<template>
  <el-container class="layout-container">
    <!-- 顶部 -->
    <el-header class="header">
      我的信息
      <el-button
        style="float: right; margin-top: 10px"
        type="danger"
        @click="logout"
      >
        退出登录
      </el-button>
    </el-header>

    <el-container>
      <!-- 左侧菜单 -->
      <el-aside width="200px" class="sidemenu">
        <el-menu :default-openeds="['1']">
          <el-submenu index="1">
            <template slot="title">
              <h3>个人中心</h3>
            </template>
            <el-menu-item index="1-1">
              <router-link to="/menu">菜单</router-link>
            </el-menu-item>
            <el-menu-item index="1-2">
              <router-link to="/profile">个人信息</router-link>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <!-- 右侧内容 -->
      <el-main>
        <el-card class="profile-card">
          <div class="card-header">
            <h2>用户信息</h2>
            <div>
              <el-button type="primary" @click="startEdit">编辑</el-button>
              <el-button type="warning" @click="resetPwdVisible = true">
                重置密码
              </el-button>
            </div>
          </div>

          <!-- 查看模式 -->
          <el-form v-if="!editing" label-width="120px" class="user-info-form">
            <el-form-item label="用户名">
              <span>{{ user.username }}</span>
            </el-form-item>
            <el-form-item label="手机号">
              <span>{{ user.phone }}</span>
            </el-form-item>
            <el-form-item label="地址">
              <span>{{ user.address }}</span>
            </el-form-item>
            <el-form-item label="注册时间">
              <span>{{ user.createTime }}</span>
            </el-form-item>
          </el-form>

          <!-- 编辑模式 -->
          <el-form
            v-else
            :model="editForm"
            label-width="120px"
            class="user-info-form"
          >
            <el-form-item label="用户名">
              <el-input v-model="editForm.username" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="editForm.phone" />
            </el-form-item>
            <el-form-item label="地址">
              <el-input v-model="editForm.address" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveEdit">保存</el-button>
              <el-button @click="cancelEdit">取消</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-main>
    </el-container>

    <!-- 重置密码弹窗 -->
    <el-dialog title="重置密码" :visible.sync="resetPwdVisible" width="400px">
      <el-form :model="resetPwdForm" label-width="100px">
        <el-form-item label="新密码">
          <el-input v-model="resetPwdForm.newPassword" show-password />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="resetPwdForm.confirmPassword" show-password />
        </el-form-item>
      </el-form>

      <span slot="footer">
        <el-button @click="resetPwdVisible = false">取消</el-button>
        <el-button type="primary" @click="submitResetPassword">
          确认
        </el-button>
      </span>
    </el-dialog>
  </el-container>
</template>

<script>
import request from "@/utils/request";

export default {
  name: "ProfileView",
  data() {
    return {
      userId: null,
      username: null,

      editing: false,
      resetPwdVisible: false,

      user: {},

      editForm: {
        username: "",
        phone: "",
        address: "",
      },

      resetPwdForm: {
        newPassword: "",
        confirmPassword: "",
      },
    };
  },

  methods: {
    /** 获取用户信息 */
    getUserInfo() {
      request
        .get(`/api/users/${this.userId}`)
        .then((res) => {
          this.user = res.data.data;
        })
        .catch((err) => {
          console.error(err);
          this.$message.error("获取用户信息失败");
        });
    },

    /** 开始编辑 */
    startEdit() {
      this.editForm = {
        username: this.user.username,
        phone: this.user.phone,
        address: this.user.address,
      };
      this.editing = true;
    },

    cancelEdit() {
      this.editing = false;
    },

    /** 保存用户信息 */
    saveEdit() {
      request
        .put(`/api/users/${this.userId}`, this.editForm)
        .then(() => {
          this.$message.success("用户信息更新成功");
          this.editing = false;
          this.getUserInfo();
        })
        .catch((err) => {
          let msg = "更新失败";
          if (err.response && err.response.data) {
            msg = err.response.data.message || msg;
          }
          this.$message.error(msg);
        });
    },

    /** 提交重置密码 */
    submitResetPassword() {
      const { newPassword, confirmPassword } = this.resetPwdForm;

      if (newPassword !== confirmPassword) {
        this.$message.error("两次密码不一致");
        return;
      }

      request
        .post("/api/users/reset", {
          userName: this.username,
          newPassword,
        })
        .then(() => {
          this.$message.success("密码重置成功");
          this.resetPwdVisible = false;
          this.resetPwdForm = { newPassword: "", confirmPassword: "" };
        })
        .catch((err) => {
          let msg = "重置失败";
          if (err.response && err.response.data) {
            msg = err.response.data.message || msg;
          }
          this.$message.error(msg);
        });
    },

    /** 退出登录 */
    logout() {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");

      this.$router.push("/login");
      this.$message.success("已退出登录");
    },
  },

  mounted() {
    this.userId = localStorage.getItem("userId");
    this.username = localStorage.getItem("username");
    this.getUserInfo();
  },
};
</script>

<style>
.header {
  font-size: 40px;
  background-color: rgb(229, 237, 251);
}

.sidemenu {
  background-color: rgb(229, 237, 251);
}

.layout-container {
  height: 100vh;
}

.profile-card {
  padding: 20px;
}

.user-info-form {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
