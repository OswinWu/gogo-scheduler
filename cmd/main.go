package main

import (
	"context"
	"gogo-scheduler/internal/handler"
	"gogo-scheduler/internal/model"
	"gogo-scheduler/internal/repository"
	"gogo-scheduler/internal/service"
	"log"
	"os"
	"path/filepath"
	"time"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/cloudwego/hertz/pkg/app/server"
	"github.com/glebarez/sqlite"
	"github.com/hertz-contrib/cors"
	"gorm.io/gorm"
)

func main() {
	// Ensure data directory exists
	if err := os.MkdirAll("data", 0755); err != nil {
		log.Fatal("Failed to create data directory:", err)
	}

	// Initialize database with new path
	db, err := gorm.Open(sqlite.Open("data/scripts.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate the schema
	err = db.AutoMigrate(&model.Script{}, &model.Task{}, &model.User{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Initialize dependencies
	scriptRepo := repository.NewScriptRepository(db)
	taskRepo := repository.NewTaskRepository(db)
	userRepo := repository.NewUserRepository(db)
	scriptService := service.NewScriptService(scriptRepo, taskRepo)
	authService := service.NewAuthService(userRepo, "your-secret-key") // Replace with environment variable in production
	scriptHandler := handler.NewScriptHandler(scriptService)
	taskHandler := handler.NewTaskHandler(scriptService)
	authHandler := handler.NewAuthHandler(authService)

	// Setup Hertz server
	h := server.Default(server.WithHostPorts("0.0.0.0:8080"))

	// CORS middleware
	h.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},                                       // Allowed domains, need to bring schema
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}, // Allowed request methods
		AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"}, // Allowed request headers
		ExposeHeaders:    []string{"Content-Length"},                          // Request headers allowed in the upload_file
		AllowCredentials: true,                                                // Whether cookies are attached
		MaxAge:           36 * time.Hour,                                      // Maximum length of upload_file-side cache preflash requests (seconds)
	}))

	h.LoadHTMLGlob("dist/index.html")
	h.Static("/", "./dist")
	h.GET("/", func(c context.Context, ctx *app.RequestContext) {
		ctx.HTML(200, "index.html", nil)
	})
	// Serve index.html for all other routes
	h.NoRoute(func(ctx context.Context, c *app.RequestContext) {
		c.File(filepath.Join("dist", "index.html"))
	})

	// no auth
	h.POST("/api/auth/login", authHandler.Login)

	g := h.Group("/api/", handler.AuthMiddleware(authService))
	// Define routes
	// Auth routes
	g.POST("/auth/change-password", authHandler.ChangePassword)
	// Script routes
	g.POST("/scripts", scriptHandler.CreateScript)
	g.GET("/scripts", scriptHandler.ListScripts)
	g.GET("/scripts/:id", scriptHandler.GetScript)
	g.PUT("/scripts/:id", scriptHandler.UpdateScript)
	g.POST("/scripts/:id/run", scriptHandler.RunScript)
	g.DELETE("/scripts/:id", scriptHandler.DeleteScript)

	// Task routes
	g.GET("/tasks", taskHandler.ListTasks)
	g.GET("/tasks/:id", taskHandler.GetTask)
	g.DELETE("/tasks/:id", taskHandler.DeleteTask)
	g.POST("/tasks/:id/rerun", taskHandler.RerunTask)
	// Start server
	if err := h.Run(); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
