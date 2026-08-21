import {
  Search,
} from "lucide-react";
import ShareButton from "../../../components/ui/Button/ShareButton";

// import ShareButton from "../../../components/ui/ShareButton";
// import UserDropdown from "../../../components/ui/UserDropdown";

function DashboardHeader() {
  return (
    <header
      className="
        h-[70px]
        flex items-center justify-between
        px-8
      "
    >
      {/* Tabs */}
      <div className="flex gap-5">

        {[
          "All",
          "Recents",
          "Folders",
          "Shared",
        ].map((item) => (
          <button
            key={item}
            className="
              px-4 py-2
              rounded-lg
              hover:bg-white/5
            "
          >
            {item}
          </button>
        ))}

      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        {/* Search */}
        <div
          className="
            w-[280px]
            h-[42px]
            rounded-xl
            border border-white/10
            flex items-center gap-3
            px-4
          "
        >
          <Search size={16} />

          <input
            placeholder="Search"
            className="
              bg-transparent
              outline-none
              flex-1
            "
          />
        </div>

        <ShareButton />

        {/* <UserDropdown /> */}

      </div>

    </header>
  );
}

export default DashboardHeader;