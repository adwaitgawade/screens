'use server';

import { db } from '@/db/drizzle';
import { screens, screenVersions, htmlContents } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export interface ProjectScreen {
    id: string;
    name: string;
    orderIndex: number | null;
    html: string;
    parentVersionId?: string | null;
    parentScreenId?: string | null;
}

export async function getProjectScreens(projectId: string): Promise<ProjectScreen[]> {
    // Get all screens for the project
    const projectScreens = await db
        .select({
            id: screens.id,
            name: screens.name,
            orderIndex: screens.orderIndex,
        })
        .from(screens)
        .where(eq(screens.projectId, projectId))
        .orderBy(screens.orderIndex);

    if (!projectScreens.length) {
        return [];
    }

    // Get the latest version with HTML content for each screen
    const screenPromises = projectScreens.map(async (screen) => {
        const [version] = await db
            .select({
                htmlContentId: screenVersions.htmlContentId,
                parentVersionId: screenVersions.parentVersionId,
            })
            .from(screenVersions)
            .where(eq(screenVersions.screenId, screen.id))
            .orderBy(desc(screenVersions.versionNumber))
            .limit(1);

        if (!version) {
            return null;
        }

        // Fetch the HTML content
        const [content] = await db
            .select({
                html: htmlContents.html,
            })
            .from(htmlContents)
            .where(eq(htmlContents.id, version.htmlContentId))
            .limit(1);

        if (!content) {
            return null;
        }

        // If there's a parent version, look up the parent screen
        let parentScreenId: string | null = null;
        if (version.parentVersionId) {
            const [parentVersion] = await db
                .select({
                    screenId: screenVersions.screenId,
                })
                .from(screenVersions)
                .where(eq(screenVersions.id, version.parentVersionId))
                .limit(1);
            if (parentVersion) {
                parentScreenId = parentVersion.screenId;
            }
        }

        return {
            id: screen.id,
            name: screen.name,
            orderIndex: screen.orderIndex,
            html: content.html,
            parentVersionId: version.parentVersionId,
            parentScreenId: parentScreenId,
        };
    });

    const results = await Promise.all(screenPromises);
    return results.filter((screen): screen is Exclude<typeof screen, null> => screen !== null) as ProjectScreen[];
}
