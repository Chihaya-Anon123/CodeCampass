package models

import (
	"CodeCampass/utils"
	"fmt"

	"gorm.io/gorm"
)

type Project struct {
	gorm.Model
	OwnerId     uint   `json:"owner_id"`
	Name        string `json:"name"`
	RepoUrl     string `json:"repo_url"`
	Description string `json:"description"`
}

func (table *Project) TableName() string {
	return "project"
}

// 得到项目列表
func GetProjectList() []*Project {
	data := make([]*Project, 10)
	utils.DB.Find(&data)
	for _, v := range data {
		fmt.Println(v)
	}
	return data
}

// 得到某用户的项目列表
func GetUserProjectList(UserId uint) []*Project {
	data := make([]*Project, 10)
	utils.DB.Where("owner_id = ?", UserId).Find(&data)
	for _, v := range data {
		fmt.Println(v)
	}
	return data
}

// 创建项目
func CreateProject(proj Project) *gorm.DB {
	return utils.DB.Create(&proj)
}

// 删除项目
func DeleteProject(proj Project) *gorm.DB {
	return utils.DB.Delete(&proj)
}

// 修改项目信息
func UpdateProject(proj Project) *gorm.DB {
	return utils.DB.Model(&proj).Updates(Project{
		Name:    proj.Name,
		RepoUrl: proj.RepoUrl,
	})
}
