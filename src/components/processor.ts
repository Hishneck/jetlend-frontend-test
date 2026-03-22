import type { Project, User, Task, ApiResponse } from "../types/types";

export type AggregatedUser = {
    name: string;
    total_estimate: number;
    projects_estimates: {
        name: string;
        total_estimate: number;
        tasks: Array<{ id: number; name: string; estimate: number }>;
    }[];
}

export const aggregatedUserData = (
    projectsData: Project[],
    usersResponse: ApiResponse<User[]>,
    tasksResponse: ApiResponse<Task[]>
): AggregatedUser[] => {
    if (usersResponse.status !== 'OK' || tasksResponse.status !== 'OK') {
        throw new Error('API response status is not OK')
    }

    const projects = projectsData
    const users = usersResponse.data
    const tasks = tasksResponse.data

    const projectMap = new Map(projects.map(p => [p.id, p]))
    const userMap = new Map(users.map(u => [u.id, u]))

    const result = new Map<number, AggregatedUser>(
        users.map(user => [
            user.id,
            {
                name: user.name,
                total_estimate: 0,
                projects_estimates: [],
            }
        ])
    )

    const userProjectMap = new Map<
        number,
        Map<number, Omit<Task, 'project_id' | 'responsible_id'>[]>
    >()

    for (const task of tasks) {
        if (task.responsible_id === null) continue;
        if (!userMap.has(task.responsible_id)) continue;
        if (!projectMap.has(task.project_id)) continue;

        if (!userProjectMap.has(task.responsible_id)) {
            userProjectMap.set(task.responsible_id, new Map());
        }
        const userProjects = userProjectMap.get(task.responsible_id)!;
        if (!userProjects.has(task.project_id)) {
            userProjects.set(task.project_id, []);
        }
        userProjects.get(task.project_id)!.push({
            id: task.id,
            name: task.name,
            estimate: task.estimate,
        });
    }

    for (const [userId, projectsMap] of userProjectMap) {
        const userResult = result.get(userId)!;
        const projectEstimates = [];

        for (const [projectId, projectTasks] of projectsMap) {
            const project = projectMap.get(projectId)!;
            const projectTotal = projectTasks.reduce(
                (sum, task) => sum + task.estimate,
                0
            );

            projectEstimates.push({
                name: project.name,
                total_estimate: projectTotal,
                tasks: projectTasks,
            });

            userResult.total_estimate += projectTotal;
        }

        userResult.projects_estimates = projectEstimates.sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }



    return Array.from(result.values()).sort((a, b) => a.name.localeCompare(b.name))

}

