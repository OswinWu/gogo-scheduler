package repository

import (
	"gogo-scheduler/internal/model"

	"gorm.io/gorm"
)

type TaskRepository struct {
	db *gorm.DB
}

func NewTaskRepository(db *gorm.DB) *TaskRepository {
	return &TaskRepository{db: db}
}

func (r *TaskRepository) Create(task *model.Task) error {
	return r.db.Create(task).Error
}

func (r *TaskRepository) GetByID(id uint) (*model.Task, error) {
	var task model.Task
	err := r.db.Preload("Script").First(&task, id).Error
	return &task, err
}

func (r *TaskRepository) List(scriptID *uint) ([]model.Task, error) {
	var tasks []model.Task
	query := r.db.Preload("Script")
	if scriptID != nil {
		query = query.Where("script_id = ?", *scriptID)
	}
	err := query.Order("created_at desc").Find(&tasks).Error
	return tasks, err
}

func (r *TaskRepository) Update(task *model.Task) error {
	return r.db.Save(task).Error
}
