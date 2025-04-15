package handler

import (
	"context"
	"errors"
	"net/http"

	"gogo-scheduler/internal/model"
	"gogo-scheduler/internal/service"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

func (h *AuthHandler) Register(ctx context.Context, c *app.RequestContext) {
	var req model.LoginRequest
	if err := c.BindJSON(&req); err != nil {
		HandleError(c, http.StatusBadRequest, err)
		return
	}

	user, err := h.authService.Register(req.Username, req.Password)
	if err != nil {
		HandleError(c, http.StatusBadRequest, err)
		return
	}

	c.JSON(http.StatusCreated, user)
}

func (h *AuthHandler) Login(ctx context.Context, c *app.RequestContext) {
	var req model.LoginRequest
	if err := c.BindJSON(&req); err != nil {
		HandleError(c, http.StatusBadRequest, err)
		return
	}

	resp, err := h.authService.Login(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *AuthHandler) ChangePassword(ctx context.Context, c *app.RequestContext) {
	AuthMiddleware(h.authService)(ctx, c)
	var req struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required"`
	}

	if err := c.BindJSON(&req); err != nil {
		HandleError(c, http.StatusBadRequest, err)
		return
	}

	// Get user from context (set by AuthMiddleware)
	user, exists := c.Get("user")
	if !exists {
		HandleError(c, http.StatusUnauthorized, errors.New("user not found"))
		return
	}

	err := h.authService.ChangePassword(user.(*model.User).Username, req.OldPassword, req.NewPassword)
	if err != nil {
		HandleError(c, http.StatusBadRequest, err)
		return
	}

	c.JSON(http.StatusOK, map[string]string{"message": "password changed successfully"})
}
