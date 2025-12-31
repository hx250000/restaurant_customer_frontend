<template>
    <el-container class="layout-container">
        <!-- 顶部 -->
        <el-header class="header">
            <span>🍽️ 餐厅点餐系统</span>
            <span style="float:right">
                <a v-on:click="toProfile" style="cursor: pointer"> 当前用户：{{ username }}</a>
            </span>
        </el-header>

        <el-container>
            <!-- 左侧分类 -->
            <el-aside width="200px" class="sidemenu">
                <el-menu :default-active="currentCategory" @select="selectCategory">
                    <el-menu-item index="all">全部</el-menu-item>
                    <el-menu-item v-for="c in categories" :key="c" :index="c">
                        {{ c }}
                    </el-menu-item>
                </el-menu>
            </el-aside>

            <!-- 右侧菜品 -->
            <el-main class="main-scroll">
                <el-row :gutter="20">
                    <el-col :span="6" v-for="dish in dishList" :key="dish.id">
                        <el-card class="dish-card">
                            <h4>{{ dish.dishname }}</h4>
                            <p>￥{{ dish.price }}</p>
                            <p>库存：{{ dish.stock }}</p>
                            <el-button type="primary" size="mini" :disabled="dish.stock <= 0" @click="addToCart(dish)">
                                加入购物车
                            </el-button>
                        </el-card>
                    </el-col>
                </el-row>
            </el-main>
        </el-container>

        <!-- 底部购物车栏 -->
        <el-footer class="footer">
            <span class="total">总金额：￥{{ totalAmount }}</span>
            <el-button type="success" @click="cartVisible = true">
                查看购物车
            </el-button>
        </el-footer>

        <!-- 购物车弹窗 -->
        <el-dialog title="购物车" :visible.sync="cartVisible" width="600px">
            <el-table :data="cart">
                <el-table-column prop="dishName" label="菜名" />
                <el-table-column prop="price" label="单价" />
                <el-table-column prop="quantity" label="数量" />
                <el-table-column prop="subtotal" label="小计" />
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="danger" size="mini" @click="removeFromCart(scope.row.dishId)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <span slot="footer">
                <el-button @click="cartVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmVisible = true">
                    去下单
                </el-button>
            </span>
        </el-dialog>

        <!-- 确认下单弹窗 -->
        <el-dialog title="确认下单" :visible.sync="confirmVisible">
            <p>订单总价：￥{{ totalAmount }}</p>

            <el-input type="textarea" v-model="remark" placeholder="订单备注（可选）" />

            <span slot="footer">
                <el-button @click="confirmVisible = false">取消</el-button>
                <el-button type="success" @click="submitOrder">
                    提交订单
                </el-button>
            </span>
        </el-dialog>
    </el-container>
</template>

<script>
import axios from "axios";

export default {
    name: "MenuView",
    data() {
        return {
            username: localStorage.getItem("username"),
            categories: [],
            currentCategory: "all",
            dishList: [],
            cart: [],
            cartVisible: false,
            confirmVisible: false,
            remark: ""
        };
    },
    computed: {
        totalAmount() {
            return this.cart.reduce((sum, i) => sum + i.subtotal, 0);
        }
    },
    created() {
        this.loadDishes();
    },
    methods: {
        loadDishes() {
            axios.get("/api/dishes/all")
                .then(res => {
                    const list = res.data.data;
                    this.dishList = list;
                    this.categories = [...new Set(list.map(d => d.category))];
                })
                .catch(err => {
                    console.warn("获取菜品失败：", err);
                    this.dishList = []; // 后端不可用时显示空列表
                    this.categories = [];
                });
        },

        selectCategory(category) {
            this.currentCategory = category;
            if (category === "all") {
                this.loadDishes();
            } else {
                const token = localStorage.getItem("jwt_token"); // ⚠️ 登录后要存入 token
                console.log(`token:${token}`);
                axios.get(`/api/dishes/category/${category}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                    .then(res => {
                        this.dishList = res.data.data;
                    })
                    .catch(err => {
                        console.warn("获取分类菜品失败：", err);
                        this.dishList = []; // 分类请求失败也显示空列表
                    });
            }
        },

        addToCart(dish) {
            const item = this.cart.find(i => i.dishId === dish.id);
            if (item) {
                item.quantity++;
                item.subtotal = item.quantity * item.price;
            } else {
                this.cart.push({
                    dishId: dish.id,
                    dishName: dish.dishname,
                    price: dish.price,
                    quantity: 1,
                    subtotal: dish.price
                });
            }
        },

        removeFromCart(dishId) {
            this.cart = this.cart.filter(i => i.dishId !== dishId);
        },

        submitOrder() {
            const token=localStorage.getItem("jwt_token");
            if (this.cart.length === 0) {
                this.$message.warning("购物车为空");
                return;
            }
            const orderRequest = {
                userId: Number(localStorage.getItem("userId")), // ⚠️ 后续从用户信息接口获取
                remark: this.remark,
                items: this.cart.map(i => ({
                    dishId: i.dishId,
                    quantity: i.quantity
                }))
            };

            axios.post("/api/orders", orderRequest,
                {headers: {
                        Authorization: `Bearer ${token}`
                    }}
            )
                .then(() => {
                    this.$message.success("下单成功");
                    this.cart = [];
                    this.cartVisible = false;
                    this.confirmVisible = false;
                    this.remark = "";
                })
                .catch(err=>{
                    this.$message.error(err);
                });
        },
        toProfile(){
            this.$router.push("/profile");
            console.log("跳转到profile");
        }
    }
};
</script>

<style scoped>
html,
body,
#app {
    margin: 0;
    overflow: hidden;

}

/* 整体布局撑满 */
.layout-container {
    height: 100vh;
    overflow: hidden;
}

/* 顶部栏 */
.header {
    height: 60px;
    line-height: 60px;
    background: #409eff;
    color: #fff;
    font-size: 18px;
    padding: 0 20px;
}

/* 左侧分类 */
.sidemenu {
    background: #f5f7fa;
    border-right: 1px solid #ebeef5;
}

/* 👇 核心：只有这里滚 */
.main-scroll {
    overflow-y: auto;
    /* padding: 20px; */
}

/* 菜品卡片 */
.dish-card {
    margin-bottom: 20px;
}

/* 底部固定栏 */
.footer {
    height: 40px;
    border-top: 1px solid #ebeef5;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* 让中间 el-container 填满 header 和 footer 之间 */
.layout-container>.el-container {
    flex: 1;
    overflow: hidden;
}

.total {
    font-size: 16px;
    font-weight: 600;
}
</style>
