package service

import (
	"errors"
	"time"

	"gogo-scheduler/internal/model"
	"gogo-scheduler/internal/repository"

	"github.com/golang-jwt/jwt/v5"
)

type AuthService struct {
	userRepo    *repository.UserRepository
	jwtSecret   []byte
	tokenExpiry time.Duration
}

func NewAuthService(userRepo *repository.UserRepository, jwtSecret string) *AuthService {
	return &AuthService{
		userRepo:    userRepo,
		jwtSecret:   []byte(jwtSecret),
		tokenExpiry: 24 * time.Hour,
	}
}

func (s *AuthService) Login(username, password string) (*model.LoginResponse, error) {
	user, err := s.userRepo.FindByUsername(username)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if !user.CheckPassword(password) {
		return nil, errors.New("invalid credentials")
	}

	token, err := s.generateToken(user)
	if err != nil {
		return nil, err
	}

	return &model.LoginResponse{
		Token: token,
		User:  *user,
	}, nil
}

func (s *AuthService) Register(username, password string) (*model.User, error) {
	existingUser, _ := s.userRepo.FindByUsername(username)
	if existingUser != nil {
		return nil, errors.New("username already exists")
	}

	user := &model.User{
		Username: username,
		Password: password,
	}

	if err := user.HashPassword(); err != nil {
		return nil, err
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) ChangePassword(username, oldPassword, newPassword string) error {
	user, err := s.userRepo.FindByUsername(username)
	if err != nil {
		return errors.New("user not found")
	}

	if !user.CheckPassword(oldPassword) {
		return errors.New("invalid old password")
	}

	return s.userRepo.ChangePassword(username, newPassword)
}

func (s *AuthService) ValidateToken(tokenString string) (*model.User, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return s.jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID := uint(claims["user_id"].(float64))
		return s.userRepo.FindByID(userID)
	}

	return nil, errors.New("invalid token")
}

func (s *AuthService) generateToken(user *model.User) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(s.tokenExpiry).Unix(),
	})

	return token.SignedString(s.jwtSecret)
}
