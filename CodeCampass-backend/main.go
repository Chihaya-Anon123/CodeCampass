package main

import (
	"CodeCampass/models"
	"CodeCampass/router"
	"CodeCampass/utils"
)

// @title CodeCampass API 文档
// @version 1.0
// @description 用户登录、登出与项目管理接口示例
// @host localhost:8081
// @BasePath /

// @securityDefinitions.apikey Bearer
// @in header
// @name Authorization

func main() {
	utils.InitConfig()
	utils.InitMySQL()
	utils.DB.AutoMigrate(&models.UserBasic{}, &models.Project{}, &models.Repo{}, &models.ProjectEmbedding{})
	utils.InitRedis()
	r := router.Router()
	r.Run(":8081") //listen on "localhost:8081"
}
