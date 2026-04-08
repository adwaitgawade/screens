'use server';

import { db } from '@/db/drizzle';
import { projects } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getProjects(userId: string) {
    const data = await db
        .select({
            id: projects.id,
            name: projects.name,
            description: projects.description,
            createdAt: projects.createdAt,
            updatedAt: projects.updatedAt,
        })
        .from(projects)
        .where(eq(projects.userId, userId))
        .orderBy(desc(projects.updatedAt));

    return data;
}

export async function getProjectById(projectId: string, userId: string) {
    const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);

    if (!project) return null;

    // Verify ownership
    if (project.userId !== userId) return null;

    return project;
}
