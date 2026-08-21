import { Outlet } from 'react-router-dom'
import useFetch from '../customHooks/useFatch'
import { workspaceService } from '../../service/workspace.service'
import type { GetMyWorkspacesResponse } from '../../types/workspace.types'
import Sidebar from '../ui/Sidebar'
import CreateWorkspaceModal, { type CreateWorkspacePayload } from '../../pages/Dashboard/component/CreateWorkspaceModal'
import { useState } from 'react'

function WorkspaceLayout() {
    const {
        data: workspaceList,
        refetch: refetchWorkspaces,
        // loading,
        // error
    } = useFetch<GetMyWorkspacesResponse>(workspaceService.getMyWorkspaces);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const workspaces = workspaceList?.data ?? [];

    const handleCreateWorkspace = async ({
        name,
        description,
    }: CreateWorkspacePayload) => {
        await workspaceService.createWorkspace(name, description);

        await refetchWorkspaces();

        setIsCreateModalOpen(false);
    };

    return (
        <>
            <div className="flex h-dvh w-full overflow-hidden">
                <Sidebar data={workspaces} onWorkspaceCreated={() => setIsCreateModalOpen(!isCreateModalOpen)} />

                <main className="flex-1 overflow-hidden">
                    <Outlet />
                </main>
            </div>

            <CreateWorkspaceModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateWorkspace}
            />
        </>
    )
}

export default WorkspaceLayout
