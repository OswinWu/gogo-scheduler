package service

import (
	"bytes"
	"fmt"
	"gogo-scheduler/internal/model"
	"gogo-scheduler/internal/repository"
	"log"
	"os/exec"
	"runtime"
	"time"

	"github.com/panjf2000/ants/v2"
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

func (s *ScriptService) RunScriptAsync(scriptID int64) (int64, error) {
	script, err := s.repo.GetByID(scriptID)
	if err != nil {
		return 0, err
	}

	// taskName format: scriptType_scriptID_scriptName_timestamp
	taskName := fmt.Sprintf("%s_%d_%s_%s", script.Type, scriptID, script.Name, time.Now().Format("20060102_150405"))

	// Create task record
	task := &model.Task{
		Name:       taskName,
		ScriptID:   script.ID,
		ScriptName: script.Name,
		Status:     "running",
		LastRun:    time.Now(),
	}
	if err := s.taskRepo.Create(task); err != nil {
		return 0, err
	}

	err = ants.Submit(func() {
		_, err := s.RunScript(scriptID, task.ID)
		if err != nil {
			log.Println("error running script:", err)
		}
	})
	return task.ID, err

}

func (s *ScriptService) RunScript(scriptID, taskID int64) (string, error) {
	script, err := s.repo.GetByID(scriptID)
	if err != nil {
		return "", err
	}

	task, err := s.taskRepo.GetByID(taskID)
	if err != nil {
		return "", err
	}

	var cmd *exec.Cmd
	var output bytes.Buffer

	switch script.Type {
	case "python":
		// if windows, use pythonw
		if runtime.GOOS == "windows" {
			cmd = exec.Command("python", "-c", script.Content)
		} else {
			cmd = exec.Command("python3", "-c", script.Content)
		}

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

func (s *ScriptService) GetScript(id int64) (*model.Script, error) {
	return s.repo.GetByID(id)
}

func (s *ScriptService) ListScripts() ([]model.Script, error) {
	return s.repo.List()
}

func (s *ScriptService) DeleteScript(id int64) error {
	return s.repo.Delete(id)
}

func (s *ScriptService) ListTasks(scriptID *int64) ([]model.Task, error) {
	return s.taskRepo.List(scriptID)
}

func (s *ScriptService) GetTask(id int64) (*model.Task, error) {
	return s.taskRepo.GetByID(id)
}

func (s *ScriptService) DeleteTask(id int64) error {
	return s.taskRepo.Delete(id)
}

func (s *ScriptService) UpdateScript(id int64, name, scriptType, content string) (*model.Script, error) {
	script, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	script.Name = name
	script.Type = scriptType
	script.Content = content

	err = s.repo.Update(script)
	return script, err
}

func (s *ScriptService) RerunTask(taskID int64) (int64, error) {
	task, err := s.taskRepo.GetByID(taskID)
	if err != nil {
		return 0, err
	}

	return s.RunScriptAsync(task.ScriptID)
}
