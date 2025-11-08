package main

import (
	"context"
	"fmt"
	"os"

	"github.com/sashabaranov/go-openai"
)

func main() {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		fmt.Println("请先设置 OPENAI_API_KEY 环境变量")
		return
	}

	// 使用 Config 配置 BaseURL
	cfg := openai.DefaultConfig(apiKey)
	cfg.BaseURL = "https://api.chatanywhere.tech" // 国内首选
	// cfg.BaseURL = "https://api.chatanywhere.org" // 国外使用

	client := openai.NewClientWithConfig(cfg)

	// 测试 ChatCompletion
	resp, err := client.CreateChatCompletion(context.Background(), openai.ChatCompletionRequest{
		Model: "gpt-3.5-turbo",
		Messages: []openai.ChatCompletionMessage{
			{Role: "user", Content: "你好，测试ChatAnywhere API是否可用"},
		},
	})

	if err != nil {
		fmt.Println("调用失败:", err)
		return
	}

	fmt.Println("回答:", resp.Choices[0].Message.Content)
}
