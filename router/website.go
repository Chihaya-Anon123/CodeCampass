package router

import (
	"CodeCampass/docs"
	"CodeCampass/middleware"
	"CodeCampass/service"

	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func Router() *gin.Engine {

	r := gin.Default()
	//swagger
	docs.SwaggerInfo.BasePath = "/"
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	//用户模块
	user := r.Group("/user")
	{
		user.GET("/getUserList", service.GetUserList)
		user.POST("/createUser", service.CreateUser)
		user.POST("/userLogin", service.UserLogin)
	}
	user.Use(middleware.AuthMiddleware())
	{
		user.POST("/userLogout", service.UserLogout)
		user.POST("/deleteUser", service.DeleteUser)
		user.GET("/getUserInfo", service.GetUserInfo)
	}

	//项目模块
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		api.POST("/createProject", service.CreateProject)
		api.GET("/listProjects", service.ListProjects)
		api.PUT("/updateProject", service.UpdateProject)
		api.DELETE("/deleteProject", service.DeleteProject)
		api.GET("/getProjectInfo", service.GetProjectInfo)
	}
	return r
}
