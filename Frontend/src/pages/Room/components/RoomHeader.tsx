import React from "react";

import logo from "../../../assets/logo.png";

import Input from "../../../components/ui/CustomInput";
// import DropdownButton from "../../../components/ui/DropdownButton";

import ShareButton from "../../../components/ui/Button/ShareButton";
import MenuDropdown from "../../../components/ui/UserMenu";
import { CgMenuRight } from "react-icons/cg";
import { FiLogOut } from "react-icons/fi";
import { AiOutlineUser } from "react-icons/ai";
import { Users } from "lucide-react";

export interface HeaderProps {
  roomName: string;
  loading?: boolean;
  onManageMembers?: () => void;
}

function Header({ roomName, loading = false, onManageMembers }: HeaderProps) {
  // const handleCopyRoomLink = async () => {
  //   try {
  //     await navigator.clipboard.writeText(
  //       window.location.href
  //     );

  //     alert("Room link copied");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  return (
    <div
      className="
        h-[47px]
        flex items-center justify-between
        px-5
        border-b border-white/5
        backdrop-blur-md
      "
    >
      {/* Left */}
      <div className="flex items-center gap-2">

        {/* Logo */}

        <div className="flex items-center gap-2" >
          <img
            src={logo}
            alt="logo"
            className="max-w-[30px] object-contain"
          />

          <span>Nexora</span>

        </div>

        <span className="text-[22px]">/</span>

        <div className="w-[130px] w-fit">
          <Input
            name="name"
            placeholder="Room Name"
            value={loading ? "Loading..." : roomName}
            disabled={loading}
            onChange={(e) =>
              console.log(e.target.value)
            }
            variant="inline"
          />
        </div>

      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {onManageMembers && (
          <button
            type="button"
            onClick={onManageMembers}
            className="
           
              py-1 px-2
              flex items-center gap-2
              rounded
             border border-white/10
              hover:bg-white/10
              
              transition-all duration-200
              text-[12px] text-white/80
            "
          >
            <Users size={14} />
            <span>Members</span>
          </button>
        )}

        <ShareButton
          onShare={() => {
            navigator.clipboard.writeText(
              window.location.href
            );
            alert("Link copied");
          }}
        />

        <MenuDropdown
          triggerIcon={<CgMenuRight size={16} />}
          iconPosition="right"
          items={[
            {
              label: "Profile",
              icon: <AiOutlineUser size={16}/>,
              onClick: () => { },
            },
            {
              label: "Sign up",
              danger: true,
              icon:<FiLogOut size={16} />,
              onClick: () => { },
            },

          ]}
        />


      </div>
    </div>
  );
}

export default Header;