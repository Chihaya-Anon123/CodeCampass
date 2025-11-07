package service

import (
	"CodeCampass/models"
	"CodeCampass/utils"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// GetUserList
// @Summary 查询所有用户
// @Tags 用户模块
// @Success 200 {string} json{"code","message"}
// @Router /user/getUserList [get]
func GetUserList(c *gin.Context) {
	data := models.GetUserList()
	c.JSON(200, gin.H{
		"code":    0, //  0成功   -1失败
		"message": "获取用户列表",
		"data":    data,
	})
}

// CreateUser
// @Summary 用户注册
// @Tags 用户模块
// @param name query string false "用户名"
// @param password query string false "密码"
// @param repassword query string false "确认密码"
// @Success 200 {string} json{"code","message"}
// @Router /user/createUser [post]
func CreateUser(c *gin.Context) {

	user := models.UserBasic{}
	user.Name = c.Request.FormValue("name")
	password := c.Request.FormValue("password")
	repassword := c.Request.FormValue("repassword")
	fmt.Println(user.Name, "  >>>>>>>>>>>  ", password, repassword)
	salt := fmt.Sprintf("%06d", rand.Int31())

	data := models.FindUserByName(user.Name)
	fmt.Println(user.Name, password, repassword)
	if user.Name == "" || password == "" || repassword == "" {
		c.JSON(200, gin.H{
			"code":    -1, //  0成功   -1失败
			"message": "用户名或密码不能为空！",
			"data":    user,
		})
		return
	}
	if data.Name != "" {
		c.JSON(200, gin.H{
			"code":    -1, //  0成功   -1失败
			"message": "用户名已注册！",
			"data":    user,
		})
		return
	}
	if password != repassword {
		c.JSON(200, gin.H{
			"code":    -1, //  0成功   -1失败
			"message": "两次密码不一致！",
			"data":    user,
		})
		return
	}
	//user.PassWord = password
	user.PassWord = utils.MakePassword(password, salt)
	user.Salt = salt
	fmt.Println(user.PassWord)
	user.LoginTime = time.Now()
	user.LoginOutTime = time.Now()
	err := models.CreateUser(user).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "新建用户失败",
		})
		return
	}
	c.JSON(200, gin.H{
		"code":    0, //  0成功   -1失败
		"message": "新增用户成功！",
		"data":    user,
	})
}

// UserLogin
// @Summary 用户登录
// @Tags 用户模块
// @param name query string false "用户名"
// @param password query string false "密码"
// @Success 200 {string} json{"code","message"}
// @Router /user/userLogin [post]
func UserLogin(c *gin.Context) {
	data := models.UserBasic{}

	name := c.Request.FormValue("name")
	password := c.Request.FormValue("password")
	user := models.FindUserByName(name)
	if user.Name == "" {
		c.JSON(200, gin.H{
			"code":    -1, //0成功   -1失败
			"message": "用户名或密码错误",
			"data":    data,
		})
		return
	}

	flag := utils.ValidPassword(password, user.Salt, user.PassWord)
	if !flag {
		c.JSON(200, gin.H{
			"code":    -1, //0成功   -1失败
			"message": "用户名或密码错误",
			"data":    data,
		})
		return
	}
	pwd := utils.MakePassword(password, user.Salt)
	data = models.FindUserByNameAndPwd(name, pwd)
	data.LoginTime = time.Now()
	utils.DB.Model(&data).Updates(models.UserBasic{
		LoginTime: data.LoginTime,
	})
	// 生成token
	token, err := utils.GenerateToken(user.ID, user.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "生成token失败",
		})
		return
	}

	c.JSON(200, gin.H{
		"code":    0, //0成功   -1失败
		"message": "登录成功",
		"data":    data,
		"token":   token,
	})
}

// UserLogout
// @Summary 用户登出
// @Tags 用户模块
// @Secuity Bearer
// @Success 200 {string} json{"code","message"}
// @Router /user/userLogout [post]
func UserLogout(c *gin.Context) {
	//后端不做处理，前端清除token即可
	c.JSON(http.StatusOK, gin.H{
		"message": "登出成功",
	})
}

// DeleteUser
// @Summary 用户注销
// @Tags 用户模块
// @Security Bearer
// @Success 200 {string} json{"code","message"}
// @Router /user/deleteUser [post]
func DeleteUser(c *gin.Context) {
	user := models.UserBasic{}
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录或token无效"})
		return
	}
	user.ID = userID.(uint)

	err := models.DeleteUser(user).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "注销失败",
		})
	}

	c.JSON(200, gin.H{
		"code":    0, //0成功   -1失败
		"message": "注销成功",
		"data":    user,
	})
}

// GetUserInfo
// @Summary 查看当前用户信息
// @Tags 用户模块
// @Security Bearer
// @Success 200 {string} json{"code","message"}
// @Router /user/getUserInfo [get]
func GetUserInfo(c *gin.Context) {
	user := models.UserBasic{}
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录或token无效"})
		return
	}
	if err := utils.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		fmt.Println(err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    -1,
			"message": "找不到用户信息，查询失败",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "查询成功",
		"data":    user,
	})
}
