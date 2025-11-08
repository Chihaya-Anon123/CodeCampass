package models

import "time"

type Repo struct {
	ProjectID    uint
	FilePath     string
	FileType     string
	Size         int64
	LastModified time.Time
	IsText       bool
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

func (table *Repo) TableName() string {
	return "repo"
}
