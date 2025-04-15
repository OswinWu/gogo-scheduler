package model

import (
	"time"

	"gorm.io/gorm"
)

type Task struct {
	ID         int64          `json:"id" gorm:"primaryKey"`
	ScriptID   int64          `json:"script_id" gorm:"not null"`
	Script     Script         `json:"script" gorm:"foreignKey:ScriptID"`
	Status     string         `json:"status"` // pending, running, success, failed
	Output     string         `json:"output"`
	StartTime  *time.Time     `json:"start_time"`
	EndTime    *time.Time     `json:"end_time"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `json:"deleted_at" gorm:"index"`
	Name       string         `json:"name"`
	ScriptName string         `json:"script_name"`
	LastRun    time.Time      `json:"last_run"`
	NextRun    time.Time      `json:"next_run"`
	Error      string         `json:"error"`
}
