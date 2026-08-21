import { FolderOpen } from 'lucide-react';
import type { ReactNode } from 'react';

export interface WorkspaceMember {
    id: string;
    name: string;
    avatar?: string;
}

export interface WorkspaceCardProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    iconClassName?: string;
    members?: WorkspaceMember[];
    totalMembers?: number;
    onClick?: () => void;
}

// const MAX_VISIBLE_MEMBERS = 3;

export default function WorkspaceCard({
    title,
    description,
    icon,
    iconClassName = '',
    totalMembers = 0,
    onClick,
}: WorkspaceCardProps) {
    // const visibleMembers = members.slice(0, MAX_VISIBLE_MEMBERS);

    // const remainingMembers = Math.max(
    //     totalMembers - visibleMembers.length,
    //     0
    // );

    return (
        <button
            type="button"
            onClick={onClick}
            className="
        group
        flex
        h-[170px]
        w-full
        flex-col
        rounded-xl
        border
        p-5
        text-left
        transition-all
        duration-200
        hover:border-white/10
      "
        >
            {/* Icon */}
            <div
                className={`
          flex
          h-12
          w-12
          relative
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${iconClassName}
        `}
            >
                {icon ?? <FolderOpen />}
                <span className=" text-white text-[12px] w-[20px] h-[20px] flex justify-center items-center absolute top-0 right-0 border px-1 rounded-full bg-[#EC2C41]">
                    {totalMembers}
                </span>
            </div>

            {/* Content */}
            <div className="mt-4">

                <h3
                    className="
            truncate
            text-[14px]
            font-semibold
            text-white
          "
                >
                    {title}
                </h3>


                {description && (
                    <p
                        className="
              mt-2
              line-clamp-2
              text-[12px]
              leading-5
              text-white/55
            "
                    >
                        {description}
                    </p>
                )}
            </div>

            {/* Bottom */}
            {/* <div
        className="
          mt-2
          flex
          justify-between
          border-t
          items-center
          pt-2
          
        "
      >
        <span className="text-[12px] text-white/55">
          {totalMembers} {totalMembers === 1 ? 'Member' : 'Members'}
        </span>

        <div className="flex items-center">
          <div className="flex -space-x-2">
            {visibleMembers.map((member) =>
              member.avatar ? (
                <img
                  key={member.id}
                  src={member.avatar}
                  alt={member.name}
                  title={member.name}
                  className="
                    h-7
                    w-7
                    rounded-full
                    border-2
                    border-[#111923]
                    object-cover
                  "
                />
              ) : (
                <div
                  key={member.id}
                  title={member.name}
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    border-[#111923]
                    bg-[#28364a]
                    text-[9px]
                    font-medium
                    text-white
                  "
                >
                  {getInitials(member.name)}
                </div>
              )
            )}
          </div>

          {remainingMembers > 0 && (
            <div
              className="
                ml-1
                flex
                h-7
                min-w-7
                items-center
                justify-center
                rounded-full
                border
                bg-[#18212d]
                px-1.5
                text-[10px]
                text-white/65
              "
            >
              +{remainingMembers}
            </div>
          )}
        </div>
      </div> */}
        </button>
    );
}

// function getInitials(name: string) {
//   return name
//     .split(' ')
//     .map((part) => part.charAt(0))
//     .join('')
//     .slice(0, 2)
//     .toUpperCase();
// }