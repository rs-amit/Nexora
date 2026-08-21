
import { useNavigate, useParams } from "react-router-dom";
import logo from "../../assets/logo.png";
import { VscNewFolder } from "react-icons/vsc";
// import { workspaceService } from "../../service/workspace.service";

type Workspace = {
  _id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

type WorkspaceMember = {
  _id: string;
  workspaceId: Workspace;
  userId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

type SidebarProps = {
  data: WorkspaceMember[];
  onWorkspaceCreated: () => void;
};



function Sidebar({ data, onWorkspaceCreated }: SidebarProps, ) {

  const navigate = useNavigate();
  const { workspaceId: activeWorkspaceId } = useParams<{ workspaceId: string }>();

  // const [files, setFiles] = useState<FileType[]>([]);

  // =========================
  // UI States
  // =========================
  // const [showWorkspaceInput, setShowWorkspaceInput] = useState(false);

  // const [workspaceName, setWorkspaceName] = useState("");

  // const [creatingWorkspace, setCreatingWorkspace] = useState(false);

  // const [showFileInput, setShowFileInput] = useState(false);


  // const [fileName, setFileName] = useState("");

  // =========================
  // Create Folder
  // =========================
  // const createWorkspace = async () => {
  //   if (!workspaceName.trim()) return;

  //   try {
  //     setCreatingWorkspace(true);

  //     await workspaceService.createWorkspace(workspaceName);

  //     setWorkspaceName("");
  //     setShowWorkspaceInput(false);
      
  //     await onWorkspaceCreated();
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setCreatingWorkspace(false);
  //   }
  // };

  // =========================
  // Create File
  // =========================
  // const createFile = () => {
  //   if (!fileName.trim()) return;

  //   const newFile = {
  //     id: Date.now(),
  //     name: fileName,
  //   };

  //   setFiles((prev) => [...prev, newFile]);

  //   setFileName("");
  //   setShowFileInput(false);
  // };

  return (
    <aside className="w-[280px] border-r border-white/5 flex flex-col">
      {/* ===================== */}
      {/* Top */}
      {/* ===================== */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="logo"
              className="max-w-[30px] object-contain"
            />

            <span className="text-[16px] font-medium">
              Nexora
            </span>
          </div>
        </div>
      </div>

      {/* ===================== */}
      {/* Workspace Section */}
      {/* ===================== */}
      <div className="flex-1 overflow-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[12px] text-white/40 font-semibold uppercase">
            Workspaces
          </span>

          <button
            onClick={onWorkspaceCreated}
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/5 transition-all"
          >
            <VscNewFolder size={16} />
          </button>
        </div>

        {/* Workspace List */}
        <div className="space-y-1">
          {data?.map((workspace) => {
            const isActive = workspace.workspaceId._id === activeWorkspaceId;

            return (
              <button
                key={workspace._id}
                onClick={() => navigate(`/workspace/${workspace.workspaceId._id}`)}
                className={`
                  w-full
                  flex
                  items-center
                  justify-between
                  pl-3
                  pr-2
                  py-2
                  rounded-lg
                  transition-all
                  text-left
                  ${isActive
                    ? "bg-[#2563EB]/15 border border-[#2563EB]/40 text-white"
                    : "hover:bg-white/5 border border-transparent"
                  }
                `}
              >
                <div>
                  <p className={`text-[14px] ${isActive ? "font-semibold" : "font-medium"}`}>
                    {workspace.workspaceId.name}
                  </p>
                </div>
              </button>
            );
          })}

          {/* Create Workspace Input */}
          {/* {showWorkspaceInput && (
            <div className="mt-2">
            <input
  autoFocus
  value={workspaceName}
  onChange={(e) => setWorkspaceName(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      createWorkspace();
    }

    if (e.key === "Escape") {
      setShowWorkspaceInput(false);
    }
  }}
  placeholder="Workspace name"
  disabled={creatingWorkspace}
  className="
    w-full
    h-[38px]
    px-3
    rounded-lg
    bg-[#171925]
    border border-white/10
    outline-none
    focus:border-[#2563EB]
    text-sm
  "
/>
            </div>
          )} */}
        </div>
      </div>

      {/* ===================== */}
      {/* Bottom */}
      {/* ===================== */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={onWorkspaceCreated}
          className="
            w-full
            py-3
            rounded
            bg-[#2563EB]
            font-medium
            flex
            items-center
            justify-center
            gap-2
            hover:opacity-90
            transition-all
          "
        >
          <VscNewFolder size={16} />
          <span>Create Workspace</span>
        </button>

        {/* {showFileInput && (
          <div className="mt-3">
            <input
              autoFocus
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  createFile();
                }

                if (e.key === "Escape") {
                  setShowFileInput(false);
                }
              }}
              placeholder="File name"
              className="
                w-full
                h-[38px]
                px-3
                rounded-lg
                bg-[#171925]
                border border-white/10
                outline-none
                focus:border-[#2563EB]
                text-sm
              "
            />
          </div>
        )} */}

        {/* {files.length > 0 && (
          <div className="mt-4 space-y-1">
            {files.map((file) => (
              <button
                key={file.id}
                className="
                  w-full
                  text-left
                  px-3
                  py-2
                  rounded-lg
                  hover:bg-white/5
                  text-sm
                  transition-all
                "
              >
                📄 {file.name}
              </button>
            ))}
          </div>
        )} */}
      </div>
    </aside>
  );
}

export default Sidebar;