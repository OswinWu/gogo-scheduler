package main

import (
	"gogo-scheduler/internal/handler"
	"gogo-scheduler/internal/model"
	"gogo-scheduler/internal/repository"
	"gogo-scheduler/internal/service"
	"log"
	"os"

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
	err = db.AutoMigrate(&model.Script{}, &model.Task{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Initialize dependencies
	scriptRepo := repository.NewScriptRepository(db)
	taskRepo := repository.NewTaskRepository(db)
	scriptService := service.NewScriptService(scriptRepo, taskRepo)
	scriptHandler := handler.NewScriptHandler(scriptService)
	taskHandler := handler.NewTaskHandler(scriptService)

	// Setup Gin router
	r := gin.Default()

	// 添加静态文件服务，将前端构建后的文件放在项目根目录的 dist 目录下
	r.Static("/static", "./dist")
	r.Static("/assets", "./dist/assets")

	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// API Routes
	api := r.Group("/api")
	{
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

	// Start server
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
