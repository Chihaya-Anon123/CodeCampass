package service

import (
	"CodeCampass/models"
	"CodeCampass/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateProject
// @Summary 创建新项目
// @Tags 项目模块
// @Security Bearer
// @param name query string false "项目名"
// @param description query string false "项目介绍"
// @param repo_url query string false "仓库网址"
// @Success 200 {object} map[string]interface{}
// @Router /api/createProject [post]
func CreateProject(c *gin.Context) {

	// 从中间件中取出当前登录用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "用户未登录",
		})
		return
	}

	name := c.Query("name")
	description := c.Query("description")
	repo_url := c.Query("repo_url")

	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "项目名不能为空",
		})
		return
	}

	same_project := models.Project{}
	utils.DB.Where("owner_id = ? and name = ?", userID, name).First(&same_project)
	if same_project.Name != "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "项目名不可重复",
		})
	}

	proj := models.Project{
		Name:        name,
		Description: description,
		OwnerId:     userID.(uint),
		RepoUrl:     repo_url,
	}

	if err := models.CreateProject(proj).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "项目创建成功",
		"data":    proj,
	})
}

// ListProjects
// @Summary 列出所有项目
// @Tags 项目模块
// @Security Bearer
// @Success 200 {object} map[string]interface{}
// @Router /api/listProjects [get]
func ListProjects(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户未登录"})
		return
	}

	var projects []models.Project
	if err := utils.DB.Where("owner_id = ?", userID).Find(&projects).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"projects": projects,
	})
}

// UpdateProject
// @Summary 修改项目
// @Tags 项目模块
// @Security Bearer
// @Param pre_name query string true "原项目名"
// @Param name query string false "新项目名"
// @Param description query string false "新项目描述"
// @Param repo_url query string false "新仓库网址"
// @Success 200 {object} map[string]interface{}
// @Router /api/updateProject [put]
func UpdateProject(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录或token无效"})
		return
	}

	pre_name := c.Query("pre_name")

	var project models.Project
	if err := utils.DB.Where("owner_id = ? and name = ?", userID, pre_name).First(&project).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "项目不存在"})
		return
	}

	if project.OwnerId != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "无权限修改此项目"})
		return
	}

	// 从 query 获取参数
	name := c.Query("name")
	description := c.Query("description")
	repoURL := c.Query("repo_url")

	if name != "" {
		project.Name = name
	}
	if description != "" {
		project.Description = description
	}
	if repoURL != "" {
		project.RepoUrl = repoURL
	}

	if err := utils.DB.Save(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "更新失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "项目更新成功",
		"project": project,
	})
}

// DeleteProject
// @Summary 删除项目
// @Tags 项目模块
// @Security Bearer
// @Param name query string true "项目名"
// @Success 200 {object} map[string]interface{}
// @Router /api/deleteProject [delete]
func DeleteProject(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录或token无效"})
		return
	}

	name := c.Query("name")

	var project models.Project
	if err := utils.DB.Where("owner_id = ? and name = ?", userID, name).First(&project).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "项目不存在",
		})
		return
	}

	if project.OwnerId != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "无权限删除此项目",
		})
		return
	}

	if err := utils.DB.Delete(&project).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "删除失败",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "项目删除成功",
	})
}

// GetProjectInfo
// @Summary 查看项目信息
// @Tags 项目模块
// @Security Bearer
// @Param name query string true "项目名"
// @Success 200 {object} map[string]interface{}
// @Router /api/getProjectInfo [get]
func GetProjectInfo(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录或token无效"})
		return
	}

	name := c.Query("name")
	var project models.Project
	if err := utils.DB.Where("owner_id = ? and name = ?", userID, name).First(&project).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "项目不存在",
		})
		return
	}

	if project.OwnerId != userID.(uint) {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "无权限查看此项目",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"code":    0,
		"message": "查看成功",
		"data":    project,
	})
}
