import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import ProjectFlow from './ProjectFlow';
import { redirect } from 'next/navigation';
import { getProjectScreens } from '@/lib/actions/screen-actions';

const ProjectPage = async ({ params }: { params: Promise<{ projectid: string }> }) => {
    const { projectid } = await params;
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect("/auth/sign-in")
    }

    const screens = await getProjectScreens(projectid);
    return <ProjectFlow screens={screens} projectId={projectid} />;
};

export default ProjectPage;