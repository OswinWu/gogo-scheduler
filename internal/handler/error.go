package handler

import "github.com/cloudwego/hertz/pkg/app"

type ErrorResponse struct {
	Message string `json:"message"`
}

func HandleError(c *app.RequestContext, code int, err error) {
	response := ErrorResponse{
		Message: err.Error(),
	}
	c.JSON(code, response)
}
