package repository

import (
	"errors"
	"gogo-scheduler/internal/model"

	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *model.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepository) FindByUsername(username string) (*model.User, error) {
	var user model.User
	err := r.db.Where("username = ?", username).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByID(id uint) (*model.User, error) {
	var user model.User
	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) CreateAdminIfNotExists() error {
	admin, err := r.FindByUsername("admin")
	if err != nil {
		return err
	}
	if admin != nil {
		return nil
	}
	admin = &model.User{
		Username: "admin",
		Password: "admin",
	}
	err = admin.HashPassword()
	if err != nil {
		return err
	}
	return r.Create(admin)
}

func (r *UserRepository) ChangePassword(username, password string) error {
	user, err := r.FindByUsername(username)
	if err != nil {
		return err
	}
	user.Password = password
	err = user.HashPassword()
	if err != nil {
		return err
	}
	return r.db.Save(user).Error
}
