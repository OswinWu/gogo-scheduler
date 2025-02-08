package main

import (
	"gogo-scheduler/internal/handler"
	"gogo-scheduler/internal/model"
	"gogo-scheduler/internal/repository"
	"gogo-scheduler/internal/service"
	"log"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func main() {
	// Initialize database
	db, err := gorm.Open(sqlite.Open("scripts.db"), &gorm.Config{})
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

	// Routes
	r.POST("/scripts", scriptHandler.CreateScript)
	r.GET("/scripts", scriptHandler.ListScripts)
	r.GET("/scripts/:id", scriptHandler.GetScript)
	r.POST("/scripts/:id/run", scriptHandler.RunScript)
	r.DELETE("/scripts/:id", scriptHandler.DeleteScript)
	r.GET("/tasks", taskHandler.ListTasks)
	r.GET("/tasks/:id", taskHandler.GetTask)

	// Start server
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
