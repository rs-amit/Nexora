/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiAddToQueue } from "react-icons/bi";
import useFetch from "../../components/customHooks/useFatch";
import Button from "../../components/ui/Button/CustomButton";
import CreateWorkspaceModal, {
  type CreateWorkspacePayload,
} from "./component/CreateWorkspaceModal";
import { workspaceService } from "../../service/workspace.service";
import { Box, Boxes, BriefcaseBusiness, Flame } from "lucide-react";
import WorkspaceCard from "./component/WorkspaceCard";
import type { GetMyWorkspacesResponse } from "../../types/workspace.types";
// import Sidebar from "./component/Sidebar";

const WORKSPACE_STYLES = [
  { icon: <Box size={22} strokeWidth={1.8} />, className: "bg-cyan-500/15 text-cyan-400" },
  { icon: <Flame size={22} strokeWidth={1.8} />, className: "bg-indigo-500/15 text-indigo-400" },
  { icon: <Boxes size={22} strokeWidth={1.8} />, className: "bg-purple-500/15 text-purple-400" },
  { icon: <BriefcaseBusiness size={22} strokeWidth={1.8} />, className: "bg-orange-500/15 text-orange-400" },
];

function Dashboard() {
  const navigate = useNavigate();

  const {
    data: workspaceList,
    refetch: refetchWorkspaces,
    loading,
    error
  } = useFetch<GetMyWorkspacesResponse>(workspaceService.getMyWorkspaces);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const workspaces: any = workspaceList?.data ?? [];

  const handleWorkspaceClick = (workspaceId: string) => {
    navigate(`/workspace/${workspaceId}`);
  };

  const handleCreateWorkspace = async ({
    name,
    description,
  }: CreateWorkspacePayload) => {
    await workspaceService.createWorkspace(name, description);

    await refetchWorkspaces();

    setIsCreateModalOpen(false);
  };



  return (
    <div className="h-screen flex text-white w-[100%] max-w-[1200px] m-auto overflow-hidden">

      <div className="w-full flex flex-col gap-10">

        <div className="border p-6 px-8 rounded flex justify-between items-center">
          <div>
            <h2 className="text-[25px]">Welcome back, User!👋</h2>
            <p>Here's what's happening across your workspaces.</p>
          </div>
          <div>
            <Button
              disabled={loading}
              fullWidth
              type="button"
              className="w-full py-2 rounded-lg text-white transition"
              leftIcon={<BiAddToQueue />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Workspace
            </Button>
          </div>
        </div>
        {
          workspaces.length > 0 && (
            <div className="w-full">
              {/* Section Header */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[16px] font-semibold text-white">
                  Your Workspaces
                </h2>

                {workspaces.length > 4 && (
                  <button
                    type="button"
                    className="
                    flex
                    items-center
                    gap-2
                    text-[12px]
                    text-blue-400
                    transition
                    hover:text-blue-300
                    "
                    onClick={() =>
                      handleWorkspaceClick(workspaces[0].workspaceId._id)
                    }
                  >
                    View all
                    <span>→</span>
                  </button>
                )}
              </div>

              {error && (
                <p className="mb-4 text-[12px] text-red-400">{error}</p>
              )}


              <div
                className="
          grid
          grid-cols-1
          gap-5
          sm:grid-cols-2
          xl:grid-cols-4
         "
              >
                {workspaces.slice(0, 4).map((workspace: any, index: number) => {
                  const style = WORKSPACE_STYLES[index % WORKSPACE_STYLES.length];

                  return (
                    <WorkspaceCard
                      key={workspace._id}
                      title={workspace.workspaceId.name}
                      description={workspace.workspaceId.description}
                      icon={style.icon}
                      iconClassName={style.className}
                      totalMembers={workspace.workspaceId.members.length}
                      onClick={() =>
                        handleWorkspaceClick(workspace.workspaceId._id)
                      }
                    />
                  );
                })}
              </div>
            </div>
          )
        }

      </div>

      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateWorkspace}
      />

    </div>
  );
}

export default Dashboard;