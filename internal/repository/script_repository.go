package repository

import (
	"gogo-scheduler/internal/model"

	"gorm.io/gorm"
)

type ScriptRepository struct {
	db *gorm.DB
}

func NewScriptRepository(db *gorm.DB) *ScriptRepository {
	return &ScriptRepository{db: db}
}

func (r *ScriptRepository) Create(script *model.Script) error {
	return r.db.Create(script).Error
}

func (r *ScriptRepository) GetByID(id uint) (*model.Script, error) {
	var script model.Script
	err := r.db.First(&script, id).Error
	return &script, err
}

func (r *ScriptRepository) List() ([]model.Script, error) {
	var scripts []model.Script
	err := r.db.Find(&scripts).Error
	return scripts, err
}

func (r *ScriptRepository) Update(script *model.Script) error {
	return r.db.Save(script).Error
}

func (r *ScriptRepository) Delete(id uint) error {
	return r.db.Delete(&model.Script{}, id).Error
}
