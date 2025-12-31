<template>
    <div class="login-container">
        <el-card class="login-card" shadow="always">
            <h2 class="title">  餐厅系统 · 用户登录</h2>
            <br/>
            <!-- 登录表单 -->
            <el-form :model="loginForm" label-width="70px">
                <el-form-item label="用户名">
                    <el-input v-model="loginForm.username" prefix-icon="el-icon-user" placeholder="请输入用户名" />
                </el-form-item>

                <el-form-item label="密码">
                    <el-input v-model="loginForm.password" type="password" prefix-icon="el-icon-lock"
                        placeholder="请输入密码" show-password />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" style="width:100%" @click="login">
                        登录
                    </el-button>
                </el-form-item>

                <div class="register-tip">
                    还没有账号？
                    <el-button type="text" @click="registerDialogVisible = true">
                        立即注册
                    </el-button>
                </div>
            </el-form>
        </el-card>

        <!-- 注册弹窗 -->
        <el-dialog title="用户注册" :visible.sync="registerDialogVisible" width="400px">
            <el-form :model="registerForm" label-width="80px">
                <el-form-item label="用户名">
                    <el-input v-model="registerForm.username" />
                </el-form-item>

                <el-form-item label="密码">
                    <el-input v-model="registerForm.password" type="password" />
                </el-form-item>

                <el-form-item label="手机号">
                    <el-input v-model="registerForm.phone" />
                </el-form-item>

                <el-form-item label="地址">
                    <el-input v-model="registerForm.address" />
                </el-form-item>
            </el-form>

            <span slot="footer">
                <el-button @click="registerDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="register">注册</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "LoginView",
    data() {
        return {
            loginForm: {
                username: "",
                password: ""
            },
            registerDialogVisible: false,
            registerForm: {
                username: "",
                password: "",
                phone: "",
                address: "/",
                userrole: "CUSTOMER"
            }
        };
    },
    methods: {
        // 登录
        login() {
            axios.post("/api/users/login", this.loginForm)
                .then(res => {
                    if (res.data.code === 200) {
                        const token = res.data.data.token;
                        localStorage.setItem("jwt_token", token);
                        localStorage.setItem("username",this.loginForm.username);
                        localStorage.setItem("userId", res.data.data.userid);
                        this.$message.success("登录成功");
                        this.$router.push("/menu");
                    } else {
                        this.$message.error(res.data.message || "登录失败");
                    }
                })
                .catch(err => {
                    console.error(err);
                    this.$message.error("登录异常" + err);
                });
        },

        // 注册
        register() {
            axios.post("/api/users/register", {
                ...this.registerForm,
                userrole: "CUSTOMER" // 也可以不传，看你后端
            })
                .then(res => {
                    if (res.data.code === 200) {
                        this.$message.success("注册成功，请登录");
                        this.registerDialogVisible = false;
                        this.loginForm.username = this.registerForm.username;
                        this.loginForm.password = "";
                    } else {
                        this.$message.error(res.data.message || "注册失败");
                    }
                })
                .catch(err => {
                    console.error(err);
                    this.$message.error("注册异常");
                });
        }
    }
};
</script>


<style scoped>
.login-container {
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #f7f4efe7, #f5f4f2);
    display: flex;
    justify-content: center;
    align-items: center;
}

.login-card {
    width: 380px;
    border-radius: 12px;
    padding-right: 20px;

}

.title {
    text-align: center;
    margin-bottom: 20px;
    color: #303133;
}

.register-tip {
    text-align: center;
    margin-top: 10px;
    font-size: 14px;
}
</style>
