package main

import (
	"gogo-scheduler/internal/handler"
	"gogo-scheduler/internal/model"
	"gogo-scheduler/internal/repository"
	"gogo-scheduler/internal/service"
	"log"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func main() {
	// 确保数据目录存在
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

	// Create admin if not exists
	err = userRepo.CreateAdminIfNotExists()
	if err != nil {
		log.Fatal("Failed to create admin:", err)
	}

	// Setup Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// API Routes
	api := r.Group("/api")
	{
		// Auth routes
		api.POST("/auth/register", authHandler.Register)
		api.POST("/auth/login", authHandler.Login)
		api.POST("/auth/change-password", handler.AuthMiddleware(authService), authHandler.ChangePassword)

		// Script routes
		api.POST("/scripts", scriptHandler.CreateScript)
		api.GET("/scripts", scriptHandler.ListScripts)
		api.GET("/scripts/:id", scriptHandler.GetScript)
		api.PUT("/scripts/:id", scriptHandler.UpdateScript)
		api.POST("/scripts/:id/run", scriptHandler.RunScript)
		api.DELETE("/scripts/:id", scriptHandler.DeleteScript)
		api.GET("/tasks", taskHandler.ListTasks)
		api.GET("/tasks/:id", taskHandler.GetTask)
		api.DELETE("/tasks/:id", scriptHandler.DeleteTask)
		api.POST("/tasks/:id/rerun", taskHandler.RerunTask)
	}

	// Serve static files
	r.Static("/static", "./dist")
	r.Static("/assets", "./dist/assets")

	// Serve index.html for all other routes
	r.NoRoute(func(c *gin.Context) {
		c.File(filepath.Join("dist", "index.html"))
	})

	// Start server
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
