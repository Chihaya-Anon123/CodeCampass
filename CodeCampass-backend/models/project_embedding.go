package models

type ProjectEmbedding struct {
	ProjectID uint
	FilePath  string
	Content   string
	Embedding string
}

func (table *ProjectEmbedding) TableName() string {
	return "project_embedding"
}
