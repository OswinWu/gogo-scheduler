package handler

import (
	"context"
	"gogo-scheduler/internal/service"
	"net/http"
	"strconv"

	"github.com/cloudwego/hertz/pkg/app"
	"github.com/gin-gonic/gin"
)

type ScriptHandler struct {
	service *service.ScriptService
}

func NewScriptHandler(service *service.ScriptService) *ScriptHandler {
	return &ScriptHandler{service: service}
}

func (h *ScriptHandler) CreateScript(ctx context.Context, c *app.RequestContext) {
	var script struct {
		Name    string `json:"name" binding:"required"`
		Type    string `json:"type" binding:"required"`
		Content string `json:"content" binding:"required"`
	}

	if err := c.BindJSON(&script); err != nil {
		HandleError(c, http.StatusBadRequest, err)
		return
	}

	result, err := h.service.CreateScript(script.Name, script.Type, script.Content)
	if err != nil {
		HandleError(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusCreated, result)
}

func (h *ScriptHandler) RunScript(ctx context.Context, c *app.RequestContext) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		HandleError(c, http.StatusBadRequest, err)
		return
	}

	output, err := h.service.RunScriptAsync(id)
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

func (h *ScriptHandler) GetScript(ctx context.Context, c *app.RequestContext) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		HandleError(c, http.StatusBadRequest, err)
		return
	}

	script, err := h.service.GetScript(id)
	if err != nil {
		HandleError(c, http.StatusNotFound, err)
		return
	}

	c.JSON(http.StatusOK, script)
}

func (h *ScriptHandler) ListScripts(ctx context.Context, c *app.RequestContext) {
	scripts, err := h.service.ListScripts()
	if err != nil {
		HandleError(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, scripts)
}

func (h *ScriptHandler) DeleteScript(ctx context.Context, c *app.RequestContext) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	if err := h.service.DeleteScript(id); err != nil {
		HandleError(c, http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *ScriptHandler) DeleteTask(ctx context.Context, c *app.RequestContext) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		HandleError(c, http.StatusBadRequest, err)
		return
	}

	if err := h.service.DeleteTask(id); err != nil {
		HandleError(c, http.StatusInternalServerError, err)
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *ScriptHandler) UpdateScript(ctx context.Context, c *app.RequestContext) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		HandleError(c, http.StatusBadRequest, err)
		return
	}

	var script struct {
		Name    string `json:"name" binding:"required"`
		Type    string `json:"type" binding:"required"`
		Content string `json:"content" binding:"required"`
	}

	if err := c.BindJSON(&script); err != nil {
		HandleError(c, http.StatusBadRequest, err)
		return
	}

	result, err := h.service.UpdateScript(id, script.Name, script.Type, script.Content)
	if err != nil {
		HandleError(c, http.StatusInternalServerError, err)
		return
	}

	c.JSON(http.StatusOK, result)
}
