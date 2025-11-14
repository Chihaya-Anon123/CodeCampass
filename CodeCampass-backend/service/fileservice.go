package service

import (
	"CodeCampass/models"
	"CodeCampass/utils"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/gin-gonic/gin"
)

// GetProjectFiles
// @Summary 获取项目文件树
// @Tags 项目模块
// @Security Bearer
// @Param name query string true "项目名"
// @Success 200 {object} map[string]interface{}
// @Router /api/getProjectFiles [get]
func GetProjectFiles(c *gin.Context) {
	name := c.Query("name")

	// 从中间件中取出当前登录用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户未登录"})
		return
	}

	// 查找项目
	var proj models.Project
	if err := utils.DB.Where("owner_id = ? and name = ?", userID, name).First(&proj).Error; err != nil {
		c.JSON(404, gin.H{"error": "项目不存在"})
		return
	}

	// 仓库目录
	baseDir := fmt.Sprintf("/home/ubuntu/Repos/%d/%d", proj.OwnerId, proj.ID)

	// 检查目录是否存在
	if _, err := os.Stat(baseDir); os.IsNotExist(err) {
		c.JSON(200, gin.H{
			"code":    0,
			"message": "仓库未同步",
			"data":    []interface{}{},
		})
		return
	}

	// 读取目录结构
	fileTree := buildFileTree(baseDir, "")

	c.JSON(200, gin.H{
		"code":    0,
		"message": "获取成功",
		"data":    fileTree,
	})
}

// GetFileContent
// @Summary 获取文件内容
// @Tags 项目模块
// @Security Bearer
// @Param name query string true "项目名"
// @Param path query string true "文件路径"
// @Success 200 {object} map[string]interface{}
// @Router /api/getFileContent [get]
func GetFileContent(c *gin.Context) {
	name := c.Query("name")
	filePath := c.Query("path")

	// 从中间件中取出当前登录用户ID
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户未登录"})
		return
	}

	// 查找项目
	var proj models.Project
	if err := utils.DB.Where("owner_id = ? and name = ?", userID, name).First(&proj).Error; err != nil {
		c.JSON(404, gin.H{"error": "项目不存在"})
		return
	}

	// 仓库目录
	baseDir := fmt.Sprintf("/home/ubuntu/Repos/%d/%d", proj.OwnerId, proj.ID)
	fullPath := filepath.Join(baseDir, filePath)

	// 安全检查：确保文件路径在仓库目录内
	relPath, err := filepath.Rel(baseDir, fullPath)
	if err != nil || strings.HasPrefix(relPath, "..") {
		c.JSON(400, gin.H{"error": "无效的文件路径"})
		return
	}

	// 检查文件是否存在
	info, err := os.Stat(fullPath)
	if os.IsNotExist(err) {
		c.JSON(404, gin.H{"error": "文件不存在"})
		return
	}

	if info.IsDir() {
		c.JSON(400, gin.H{"error": "路径是目录，不是文件"})
		return
	}

	// 检查文件大小（限制最大5MB）
	if info.Size() > 5*1024*1024 {
		c.JSON(400, gin.H{"error": "文件过大，超过5MB"})
		return
	}

	// 读取文件内容
	content, err := ioutil.ReadFile(fullPath)
	if err != nil {
		c.JSON(500, gin.H{"error": fmt.Sprintf("读取文件失败: %v", err)})
		return
	}

	c.JSON(200, gin.H{
		"code":    0,
		"content": string(content),
		"path":    filePath,
	})
}

// buildFileTree 构建文件树
func buildFileTree(baseDir, relativePath string) []map[string]interface{} {
	var result []map[string]interface{}
	fullPath := filepath.Join(baseDir, relativePath)

	// 读取目录
	entries, err := ioutil.ReadDir(fullPath)
	if err != nil {
		return result
	}

	// 排序：目录在前，文件在后
	sort.Slice(entries, func(i, j int) bool {
		if entries[i].IsDir() != entries[j].IsDir() {
			return entries[i].IsDir()
		}
		return entries[i].Name() < entries[j].Name()
	})

	for _, entry := range entries {
		// 跳过隐藏文件和 .git 目录
		if strings.HasPrefix(entry.Name(), ".") {
			continue
		}

		nodePath := filepath.Join(relativePath, entry.Name())
		node := map[string]interface{}{
			"title":  entry.Name(),
			"key":    nodePath,
			"isLeaf": !entry.IsDir(),
			"path":   nodePath,
		}

		// 如果是目录，递归获取子节点
		if entry.IsDir() {
			children := buildFileTree(baseDir, nodePath)
			if len(children) > 0 {
				node["children"] = children
			}
		}

		result = append(result, node)
	}

	return result
}

