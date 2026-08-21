import { useNavigate } from "react-router-dom";

const files = [
  {
    id: 1,
    name: "System Design",
    author: "Amit",
    updated: "2h ago",
  },
];

function FileTable() {
  const navigate = useNavigate();

  return (
    <div
      className="
        rounded-2xl
        border border-white/5
        overflow-hidden
      "
    >
      {/* Header */}
      <div
        className="
          grid grid-cols-4
          px-6 py-4
          text-xs
          uppercase
          text-white/40
          border-b border-white/5
        "
      >
        <div>Name</div>
        <div>Author</div>
        <div>Updated</div>
        <div>Action</div>
      </div>

      {/* Rows */}
      {files.map((file) => (
        <button
          key={file.id}
          onClick={() =>
            navigate(`/room/${file.id}`)
          }
          className="
            w-full
            grid grid-cols-4
            px-6 py-5
            text-left
            hover:bg-white/5
            border-b border-white/5
          "
        >
          <div>{file.name}</div>
          <div>{file.author}</div>
          <div>{file.updated}</div>
          <div>Open</div>
        </button>
      ))}
    </div>
  );
}

export default FileTable;