package service

import (
	"bytes"
	"fmt"
	"gogo-scheduler/internal/model"
	"gogo-scheduler/internal/repository"
	"os/exec"
	"time"
)

type ScriptService struct {
	repo     *repository.ScriptRepository
	taskRepo *repository.TaskRepository
}

func NewScriptService(repo *repository.ScriptRepository, taskRepo *repository.TaskRepository) *ScriptService {
	return &ScriptService{repo: repo, taskRepo: taskRepo}
}

func (s *ScriptService) CreateScript(name, scriptType, content string) (*model.Script, error) {
	script := &model.Script{
		Name:    name,
		Type:    scriptType,
		Content: content,
	}
	err := s.repo.Create(script)
	return script, err
}

func (s *ScriptService) RunScript(scriptID uint) (string, error) {
	script, err := s.repo.GetByID(scriptID)
	if err != nil {
		return "", err
	}

	// Generate task name: script_id + script_name + run_date
	taskName := fmt.Sprintf("%d_%s_%s", scriptID, script.Name, time.Now().Format("20060102_150405"))

	// Create task record
	task := &model.Task{
		Name:       taskName,
		ScriptID:   script.ID,
		ScriptName: script.Name,
		Status:     "running",
		LastRun:    time.Now(),
	}
	if err := s.taskRepo.Create(task); err != nil {
		return "", err
	}

	var cmd *exec.Cmd
	var output bytes.Buffer

	switch script.Type {
	case "python":
		cmd = exec.Command("python3", "-c", script.Content)
	case "shell":
		cmd = exec.Command("bash", "-c", script.Content)
	default:
		return "", fmt.Errorf("unsupported script type: %s", script.Type)
	}

	cmd.Stdout = &output
	cmd.Stderr = &output

	err = cmd.Run()
	endTime := time.Now()
	task.EndTime = &endTime
	task.Output = output.String()

	if err != nil {
		task.Status = "failed"
		s.taskRepo.Update(task)
		return output.String(), err
	}

	task.Status = "success"
	s.taskRepo.Update(task)
	return output.String(), nil
}

func (s *ScriptService) GetScript(id uint) (*model.Script, error) {
	return s.repo.GetByID(id)
}

func (s *ScriptService) ListScripts() ([]model.Script, error) {
	return s.repo.List()
}

func (s *ScriptService) DeleteScript(id uint) error {
	return s.repo.Delete(id)
}

func (s *ScriptService) ListTasks(scriptID *uint) ([]model.Task, error) {
	return s.taskRepo.List(scriptID)
}

func (s *ScriptService) GetTask(id uint) (*model.Task, error) {
	return s.taskRepo.GetByID(id)
}

func (s *ScriptService) DeleteTask(id uint) error {
	return s.taskRepo.Delete(id)
}
