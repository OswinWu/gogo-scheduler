package handler

import (
	"gogo-scheduler/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type TaskHandler struct {
	service *service.ScriptService
}

func NewTaskHandler(service *service.ScriptService) *TaskHandler {
	return &TaskHandler{service: service}
}

func (h *TaskHandler) ListTasks(c *gin.Context) {
	var scriptID *uint
	if idStr := c.Query("script_id"); idStr != "" {
		if id, err := strconv.ParseUint(idStr, 10, 32); err == nil {
			uid := uint(id)
			scriptID = &uid
		}
	}

	tasks, err := h.service.ListTasks(scriptID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tasks)
}

func (h *TaskHandler) GetTask(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	task, err := h.service.GetTask(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "task not found"})
		return
	}

	c.JSON(http.StatusOK, task)
}

func (h *TaskHandler) RerunTask(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	output, err := h.service.RerunTask(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Task rerun started",
		"task_id": output,
	})
}
