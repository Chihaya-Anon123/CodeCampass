package service

import (
	"CodeCampass/models"
	"CodeCampass/utils"
	"context"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"os"
	"sort"

	"github.com/gin-gonic/gin"
	"github.com/sashabaranov/go-openai"
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

// AskProject
// @Summary LLM代码问答
// @Tags 项目模块
// @Security Bearer
// @Param name query string  true "项目名"
// @Param question query string true "用户问题"
// @Success 200 {object} map[string]string "answer"
// @Router /api/askProject [post]
func AskProject(c *gin.Context) {
	name := c.Query("name")
	question := c.Query("question")

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

	// 从 Redis 获取用户的 API Key
	apiKey := utils.Red.Get(utils.Red.Context(), fmt.Sprintf("openai_key:%d", userID)).Val()
	
	// 如果 Redis 中没有，从环境变量获取（向后兼容）
	if apiKey == "" {
		apiKey = os.Getenv("OPENAI_API_KEY")
	}

	if apiKey == "" {
		c.JSON(500, gin.H{"error": "请先设置 OpenAI API Key"})
		return
	}

	// 配置 ChatAnywhere
	cfg := openai.DefaultConfig(apiKey)
	//cfg.BaseURL = "https://api.chatanywhere.tech" // 国内首选
	cfg.BaseURL = "https://api.chatanywhere.org" // 国外使用
	client := openai.NewClientWithConfig(cfg)

	// 生成问题 embedding
	embResp, err := client.CreateEmbeddings(context.Background(), openai.EmbeddingRequest{
		Model: openai.SmallEmbedding3,
		Input: []string{question},
	})
	if err != nil {
		c.JSON(500, gin.H{"error": "embedding生成失败"})
		return
	}
	questionVec := embResp.Data[0].Embedding

	// 查询项目所有文件 embedding
	var all []models.ProjectEmbedding
	utils.DB.Where("project_id = ?", proj.ID).Find(&all)

	type ScoredChunk struct {
		Path    string
		Content string
		Score   float64
	}

	var topChunks []ScoredChunk
	for _, e := range all {
		// JSON 反序列化 embedding
		var emb []float32
		if err := json.Unmarshal([]byte(e.Embedding), &emb); err != nil {
			fmt.Println("embedding解析失败:", e.FilePath, err)
			continue
		}
		score := cosineSimilarity(emb, questionVec)
		topChunks = append(topChunks, ScoredChunk{
			Path:    e.FilePath,
			Content: e.Content,
			Score:   score,
		})
	}

	// 取前三个最相关片段
	sort.Slice(topChunks, func(i, j int) bool { return topChunks[i].Score > topChunks[j].Score })
	if len(topChunks) > 3 {
		topChunks = topChunks[:3]
	}

	// 拼接上下文
	var contextText string
	for _, chunk := range topChunks {
		contextText += fmt.Sprintf("\n[文件: %s]\n%s\n", chunk.Path, chunk.Content)
	}

	prompt := fmt.Sprintf(`你是一名代码分析专家，请基于以下仓库内容回答问题：
%s

问题：%s`, contextText, question)

	// 调用 LLM
	chatResp, err := client.CreateChatCompletion(context.Background(), openai.ChatCompletionRequest{
		Model: openai.GPT4oMini,
		Messages: []openai.ChatCompletionMessage{
			{Role: "system", Content: "你是代码与软件架构专家。"},
			{Role: "user", Content: prompt},
		},
	})
	if err != nil {
		c.JSON(500, gin.H{"error": fmt.Sprintf("LLM调用失败: %v", err)})
		return
	}

	c.JSON(200, gin.H{"answer": chatResp.Choices[0].Message.Content})
}

func cosineSimilarity(a, b []float32) float64 {
	if len(a) != len(b) {
		return 0
	}
	var dot, normA, normB float64
	for i := range a {
		dot += float64(a[i] * b[i])
		normA += float64(a[i] * a[i])
		normB += float64(b[i] * b[i])
	}
	if normA == 0 || normB == 0 {
		return 0
	}
	return dot / (math.Sqrt(normA) * math.Sqrt(normB))
}
