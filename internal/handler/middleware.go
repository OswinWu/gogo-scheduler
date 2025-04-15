package handler

import (
	"context"
	"net/http"
	"strings"

	"gogo-scheduler/internal/service"

	"github.com/cloudwego/hertz/pkg/app"
)

func AuthMiddleware(authService *service.AuthService) app.HandlerFunc {
	return func(c context.Context, ctx *app.RequestContext) {
		authHeaderStr := ctx.GetHeader("Authorization")
		if len(authHeaderStr) == 0 {
			ctx.JSON(http.StatusUnauthorized, map[string]string{"error": "authorization header is required"})
			ctx.Abort()
			return
		}

		authHeader := string(authHeaderStr)
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			ctx.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid authorization header format"})
			ctx.Abort()
			return
		}

		user, err := authService.ValidateToken(parts[1])
		if err != nil {
			ctx.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid token"})
			ctx.Abort()
			return
		}

		ctx.Set("user", user)
		ctx.Next(c)
	}
}
