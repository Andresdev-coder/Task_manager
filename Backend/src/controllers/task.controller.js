import Task from '../models/Task.js';
import Project from '../models/Project.js';

// Verifica que el proyecto exista y le pertenezca al usuario autenticado
const verifyProjectOwnership = async (projectId, userId) => {
  return Project.findOne({ _id: projectId, owner: userId });
};

export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwnership(projectId, req.userId);
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    // Filtros opcionales por query string: ?status=pendiente&priority=alta
    const filters = { project: projectId };
    if (req.query.status) filters.status = req.query.status;
    if (req.query.priority) filters.priority = req.query.priority;

    const tasks = await Task.find(filters).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await verifyProjectOwnership(projectId, req.userId);
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'El título es obligatorio' });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      project: projectId,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const project = await verifyProjectOwnership(projectId, req.userId);
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: taskId, project: projectId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const project = await verifyProjectOwnership(projectId, req.userId);
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    const task = await Task.findOneAndDelete({ _id: taskId, project: projectId });
    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    res.json({ message: 'Tarea eliminada' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
