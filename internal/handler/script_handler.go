package handler

import (
	"gogo-scheduler/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ScriptHandler struct {
	service *service.ScriptService
}

func NewScriptHandler(service *service.ScriptService) *ScriptHandler {
	return &ScriptHandler{service: service}
}

func (h *ScriptHandler) CreateScript(c *gin.Context) {
	var script struct {
		Name    string `json:"name" binding:"required"`
		Type    string `json:"type" binding:"required"`
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&script); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.service.CreateScript(script.Name, script.Type, script.Content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, result)
}

func (h *ScriptHandler) RunScript(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	output, err := h.service.RunScript(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  err.Error(),
			"output": output,
			"status": "failed",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"output": output,
		"status": "success",
	})
}

func (h *ScriptHandler) GetScript(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	script, err := h.service.GetScript(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "script not found"})
		return
	}

	c.JSON(http.StatusOK, script)
}

func (h *ScriptHandler) ListScripts(c *gin.Context) {
	scripts, err := h.service.ListScripts()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, scripts)
}

func (h *ScriptHandler) DeleteScript(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.service.DeleteScript(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
