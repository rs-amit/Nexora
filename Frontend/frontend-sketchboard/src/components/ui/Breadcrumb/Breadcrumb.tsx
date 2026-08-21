import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  Search,
  ChevronRight,
//   User,
//   LogOut,
//   ChevronDown,
} from "lucide-react";

// import MenuDropdown from "../../ui/UserMenu";

interface BreadcrumbProps {
  homeLabel?: string;
}

const Breadcrumb = ({
  homeLabel = "Home",
}: BreadcrumbProps) => {
  const location = useLocation();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//   const handleProfile = () => {
//     navigate("/profile");
//   };

  const pathnames = location.pathname
    .split("/")
    .filter(Boolean);

  const breadcrumbs = pathnames.map(
    (segment, index) => {
      const path =
        "/" +
        pathnames
          .slice(0, index + 1)
          .join("/");

      const label = segment
        .replace(/-/g, " ")
        .replace(
          /\b\w/g,
          (char) => char.toUpperCase()
        );

      return {
        label,
        path,
      };
    }
  );

//   const menuItems = [
//     {
//       label: "Profile",
//       icon: <User size={16} />,
//       onClick: handleProfile,
//     },
//     {
//       label: "Logout",
//       icon: <LogOut size={16} />,
//       danger: true,
//       onClick: handleLogout,
//     },
//   ];

  return (
    <div className="flex items-center justify-between">
      {/* Breadcrumb */}
      <nav
        aria-label="breadcrumb"
        className="flex items-center text-sm"
      >
        <Link
          to="/"
          className="text-gray-500 hover:text-primary transition-colors"
        >
          {homeLabel}
        </Link>

        {breadcrumbs.map((crumb, index) => {
          const isLast =
            index === breadcrumbs.length - 1;

          return (
            <div
              key={crumb.path}
              className="flex items-center"
            >
              <ChevronRight
                size={16}
                className="mx-2 text-gray-400"
              />

              {isLast ? (
                <span className="font-medium text-gray-900">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-gray-500 hover:text-primary transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <button className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <Bell size={18} />
        </button>

        <button className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <Search size={18} />
        </button>

        {/* <MenuDropdown
          items={menuItems}
          trigger={
            <button className="flex items-center gap-2 rounded-lg px-3 py-2  transition-colors">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-semibold">
                A
              </div>

              <div className="hidden text-left md:block">
                <p className="text-sm font-medium">
                  Amit Mishra
                </p>
                <p className="text-xs text-gray-500">
                  Administrator
                </p>
              </div>

              <ChevronDown
                size={16}
                className="text-gray-500"
              />
            </button>
          }
          menuClassName="border rounded-xl shadow-lg py-2"
        /> */}
      </div>
    </div>
  );
};

export default Breadcrumb;