import format from 'date-fns/format';
import add from 'date-fns/add';
import startOfWeek from 'date-fns/startOfWeek';
import endOfWeek from 'date-fns/endOfWeek';
import Project from '../components/project';
import Task from '../components/task';

const projectController = (() => {
	const allProjects = [];
	const createProject = (name) => {
		const project = new Project(name);
		allProjects.push(project);
		return project;
	};

	const getProjectIndex = (name) => {
		const index = allProjects.findIndex((project) => project.name === name);
		return index;
	};

	const deleteProject = (name) => {
		const index = getProjectIndex(name);
		allProjects.splice(index, 1);
	};

	const editProjectName = (projectName, newName) => {
		const index = getProjectIndex(projectName);
		allProjects[index].name = newName;
		allProjects[index].tasks.forEach(
			(task) => (task.associatedProject = newName)
		);
	};

	const getProjectTasks = (projectName) => {
		const index = getProjectIndex(projectName);
		const thisProject = allProjects[index];
		return thisProject.tasks;
	};
	const sortProjectTasksByCreationTime = (projectName) => {
		const sortedTasks = getProjectTasks(projectName).sort((a, b) => {
			if (a.createdTime > b.createdTime) {
				return 1;
			}
			if (a.createdTime < b.createdTime) {
				return -1;
			}
		});
		return sortedTasks;
	};

	const sortProjectCompletedTasks = (projectName) => {
		const sortedProject = sortProjectTasksByCreationTime(projectName).sort(
			(a, b) => {
				if (a.isCompleted > b.isCompleted) {
					return 1;
				}
				if (a.isCompleted < b.isCompleted) {
					return -1;
				}
			}
		);
		return sortedProject;
	};

	createProject('Inbox');
	const initializeDefaultProjects = () => {
		createProject('Getting Started');
	};
	return {
		allProjects,
		createProject,
		deleteProject,
		editProjectName,
		getProjectIndex,
		getProjectTasks,
		sortProjectCompletedTasks,
		sortProjectTasksByCreationTime,
		initializeDefaultProjects,
	};
})();

const taskController = (() => {
	let allTasks = [];
	const getAllTasks = () => {
		allTasks = [];
		projectController.allProjects.forEach((project) => {
			allTasks = allTasks.concat(project.tasks);
		});
		return allTasks;
	};
	const createTask = (
		title,
		description,
		priority,
		dueDate,
		isCompleted,
		associatedProject
	) => {
		const task = new Task(
			title,
			description,
			priority,
			dueDate,
			isCompleted,
			associatedProject
		);
		const projectIndex = projectController.getProjectIndex(associatedProject);
		projectController.allProjects.at(projectIndex).tasks.push(task);
		return task;
	};

	const getTaskIndex = (projectName, taskTitle) => {
		const projectIndex = projectController.getProjectIndex(projectName);
		const parentProject = projectController.allProjects[projectIndex];
		const projectTasks = parentProject.tasks;
		const taskIndex = projectTasks.findIndex(
			(task) => task.title === taskTitle
		);

		return { projectTasks, taskIndex };
	};
	const returnThisTask = (projectName, taskTitle) => {
		const { taskIndex, projectTasks } = getTaskIndex(projectName, taskTitle);
		return projectTasks.at(taskIndex);
	};

	const deleteTask = (projectName, taskTitle) => {
		const { taskIndex, projectTasks } = getTaskIndex(projectName, taskTitle);
		return projectTasks.splice(taskIndex, 1);
	};

	const markTaskCompleted = (projectName, taskTitle) => {
		const { taskIndex, projectTasks } = getTaskIndex(projectName, taskTitle);
		if (projectTasks.at(taskIndex).isCompleted === false) {
			projectTasks.at(taskIndex).isCompleted = true;
		} else projectTasks.at(taskIndex).isCompleted = false;
		return projectTasks.at(taskIndex).isCompleted;
	};
	const moveTaskToProject = (taskTitle, oldProject, newProject) => {
		const { taskIndex } = getTaskIndex(oldProject, taskTitle);
		const oldProjectIndex = projectController.getProjectIndex(oldProject);
		const newProjectIndex = projectController.getProjectIndex(newProject);
		const oldProjectTasks =
			projectController.allProjects[oldProjectIndex].tasks;
		const newProjectTasks =
			projectController.allProjects[newProjectIndex].tasks;
		newProjectTasks.push(oldProjectTasks[taskIndex]);
		oldProjectTasks.splice(taskIndex, 1);
	};
	const editTask = (
		projectName,
		taskTitle,
		newTitle,
		newDescription,
		newPriority,
		newDueDate,
		newIsCompleted,
		newAssociatedProject
	) => {
		const { taskIndex, projectTasks } = getTaskIndex(projectName, taskTitle);
		projectTasks.at(taskIndex).title = newTitle;
		projectTasks.at(taskIndex).description = newDescription;
		projectTasks.at(taskIndex).priority = newPriority;
		projectTasks.at(taskIndex).dueDate = newDueDate;
		projectTasks.at(taskIndex).isCompleted = newIsCompleted;
		projectTasks.at(taskIndex).associatedProject = newAssociatedProject;
		moveTaskToProject(taskTitle, projectName, newAssociatedProject);
	};

	const sortTasksByCreationTime = () => {
		const sortedTasks = getAllTasks().sort((a, b) => {
			if (a.createdTime > b.createdTime) {
				return 1;
			}
			if (a.createdTime < b.createdTime) {
				return -1;
			}
		});
		return sortedTasks;
	};

	const sortCompletedTasks = () => {
		const sortedTasks = sortTasksByCreationTime().sort((a, b) => {
			if (a.isCompleted > b.isCompleted) {
				return 1;
			}
			if (a.isCompleted < b.isCompleted) {
				return -1;
			}
		});
		return sortedTasks;
	};

	const getTodaysTasks = () => {
		const dateFormatted = format(new Date(), 'yyyy-MM-dd');
		const todayCollection = Object.values(sortCompletedTasks()).filter(
			(task) => task.dueDate === dateFormatted
		);
		return todayCollection;
	};

	const getWeekTasks = () => {
		const weekStart = format(
			startOfWeek(new Date(), { weekStartsOn: 1 }),
			'yyyy-MM-dd'
		);
		const weekEnd = format(
			endOfWeek(new Date(), { weekStartsOn: 1 }),
			'yyyy-MM-dd'
		);
		const weekCollection = Object.values(sortCompletedTasks()).filter(
			(task) => task.dueDate >= weekStart && task.dueDate <= weekEnd
		);
		return weekCollection;
	};
	const getCompletedTasks = () => {
		const completedCollection = Object.values(sortCompletedTasks()).filter(
			(task) => task.isCompleted === true
		);
		return completedCollection;
	};

	const initializeDefaultTasks = () => {
		createTask(
			'(Click Me To Begin)',
			"Click on the title of a task to open the task details pane. \n To mark as complete, click the checkbox to the right of this task's title.",
			'Low',
			format(add(new Date(), { hours: 24 }), 'yyyy-MM-dd'),
			false,
			'Getting Started'
		);
		createTask(
			'Opening The Project Pane',
			'Click on the hamburger icon in the left of the header to open the project pane. The project pane is used to filter tasks and modify projects.',
			'Low',
			format(add(new Date(), { hours: 24 }), 'yyyy-MM-dd'),
			false,
			'Getting Started'
		);
		createTask(
			'Creating Tasks',
			"Create a new task by clicking the (+) icon near the top right of the screen. Tasks will automatically be added to the 'Inbox' project. Use this project as a temporary place quickly add new tasks before assigning them to another project.",
			'Low',
			format(add(new Date(), { hours: 24 }), 'yyyy-MM-dd'),
			false,
			'Getting Started'
		);
		createTask(
			'Creating Projects',
			'Create a new project by using project pane and entering a new project name in the text input.',
			'Low',
			format(add(new Date(), { hours: 24 }), 'yyyy-MM-dd'),
			false,
			'Getting Started'
		);
		createTask(
			'Assigning A Task To A Project',
			'Click the edit task icon inside of the task details pane to choose the project name from the project select dropdown. Click "Edit Task" to submit changes.',
			'Low',
			format(add(new Date(), { hours: 24 }), 'yyyy-MM-dd'),
			false,
			'Getting Started'
		);
		createTask(
			'Editing Tasks',
			'Use the edit task icon to edit details about the task.',
			'Low',
			format(add(new Date(), { hours: 24 }), 'yyyy-MM-dd'),
			false,
			'Getting Started'
		);
		createTask(
			'Deleting Tasks',
			'Click the delete task icon next to the edit task icon in the task details pane. This action can not be undone.',
			'Low',
			format(add(new Date(), { hours: 24 }), 'yyyy-MM-dd'),
			false,
			'Getting Started'
		);
		createTask(
			'Renaming Projects',
			'Click the edit project icon to the right of the project name which you would like to edit. The above form will enter "edit" mode to allow the project name to be changed. All tasks within the project will be automatically updated to the new project name.',
			'Low',
			format(add(new Date(), { hours: 24 }), 'yyyy-MM-dd'),
			false,
			'Getting Started'
		);
		createTask(
			'Deleting Projects',
			'Click the delete project icon to the right of the project name which you would like to delete. All tasks within the project will also be deleted. This can not be undone - please proceed with caution.',
			'High',
			format(add(new Date(), { hours: 24 }), 'yyyy-MM-dd'),
			false,
			'Getting Started'
		);
	};
	return {
		allTasks,
		getAllTasks,
		sortCompletedTasks,
		sortTasksByCreationTime,
		createTask,
		getTaskIndex,
		deleteTask,
		markTaskCompleted,
		editTask,
		returnThisTask,
		getTodaysTasks,
		getWeekTasks,
		getCompletedTasks,
		initializeDefaultTasks,
	};
})();

export { projectController, taskController };
