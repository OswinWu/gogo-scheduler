package handler

import (
	"context"
	"gogo-scheduler/internal/service"
	"net/http"
	"strconv"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/gin-gonic/gin"
)

type TaskHandler struct {
	service *service.ScriptService
}

func NewTaskHandler(service *service.ScriptService) *TaskHandler {
	return &TaskHandler{service: service}
}

func (h *TaskHandler) ListTasks(ctx context.Context, c *app.RequestContext) {
	var scriptID *int64
	if idStr := c.Query("script_id"); idStr != "" {
		if id, err := strconv.ParseInt(idStr, 10, 64); err == nil {
			scriptID = &id
		}
	}

	tasks, err := h.service.ListTasks(scriptID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, tasks)
}

func (h *TaskHandler) GetTask(ctx context.Context, c *app.RequestContext) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	task, err := h.service.GetTask(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "task not found"})
		return
	}

	c.JSON(http.StatusOK, task)
}

func (h *TaskHandler) RerunTask(ctx context.Context, c *app.RequestContext) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	output, err := h.service.RerunTask(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Task rerun started",
		"task_id": output,
	})
}

func (h *TaskHandler) DeleteTask(ctx context.Context, c *app.RequestContext) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	err = h.service.DeleteTask(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Task deleted successfully",
	})
}
