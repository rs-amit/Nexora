import mongoose from "mongoose";
import axios from "axios";

import Workspace from "../models/workspace.model.js";
import WorkspaceMember from "../models/workspace-membe.model.js";
import Room from "../models/room.model.js";

const INVITABLE_ROLES = ["EDITOR", "VIEWER"];

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

export const createWorkspace = async ({
    name,
    description,
    ownerId,
}) => {
    const session =
        await mongoose.startSession();

    session.startTransaction();

    try {
        const workspace =
            await Workspace.create(
                [
                    {
                        name,
                        description,
                        createdBy: ownerId,
                    },
                ],
                { session }
            );

        await WorkspaceMember.create(
            [
                {
                    workspaceId: workspace[0]._id,
                    userId: ownerId,
                    role: "OWNER",
                },
            ],
            { session }
        );

        await session.commitTransaction();

        return workspace[0];
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};


export const getWorkspaceById = async (workspaceId, userId) => {
  const membership = await WorkspaceMember.findOne({
    workspaceId,
    userId,
  }).lean();

  if (!membership) {
    const error = new Error("You are not a member of this workspace");
    error.statusCode = 403;
    throw error;
  }

  const workspace = await Workspace.findById(workspaceId).lean();

  if (!workspace) {
    const error = new Error("Workspace not found");
    error.statusCode = 404;
    throw error;
  }

  const members = await WorkspaceMember.find({ workspaceId }).lean();

  const oneWeekAgo = new Date(Date.now() - WEEK_IN_MS);

  const newMembersThisWeek = members.filter(
    (member) => new Date(member.createdAt) >= oneWeekAgo
  ).length;

  const [roomCount, activeRoomCount, mostRecentRoom] = await Promise.all([
    Room.countDocuments({ workspaceId }),
    Room.countDocuments({ workspaceId, status: "ACTIVE" }),
    Room.findOne({ workspaceId }).sort({ updatedAt: -1 }).lean(),
  ]);

  let lastActivity = {
    at: workspace.updatedAt,
    userId: workspace.createdBy,
  };

  if (
    mostRecentRoom &&
    new Date(mostRecentRoom.updatedAt) > new Date(lastActivity.at)
  ) {
    lastActivity = {
      at: mostRecentRoom.updatedAt,
      userId: mostRecentRoom.createdBy,
    };
  }

  return {
    ...workspace,
    members: members.map((member) => ({
      userId: member.userId,
      role: member.role,
      joinedAt: member.createdAt,
    })),
    stats: {
      memberCount: members.length,
      newMembersThisWeek,
      roomCount,
      activeRoomCount,
      lastActivity,
    },
  };
};

export const getMyWorkspaces = async (userId) => {
  const memberships = await WorkspaceMember.find({
    userId,
  })
    .populate({
      path: "workspaceId",
      select: "name description createdBy createdAt updatedAt",
    })
    .lean();

    console.log("memberships", memberships )
  const workspaceIds = memberships.map(
    (membership) => membership.workspaceId._id
  );


  const allMembers = await WorkspaceMember.find({
    workspaceId: { $in: workspaceIds },
  }).lean();

  const membersByWorkspace = allMembers.reduce((acc, member) => {
    const key = member.workspaceId.toString();

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push({
      userId: member.userId,
      role: member.role,
    });

    return acc;
  }, {});

  return memberships.map((membership) => ({
    ...membership,
    workspaceId: {
      ...membership.workspaceId,
      members: membersByWorkspace[membership.workspaceId._id.toString()] || [],
    },
  }));
};

export const inviteMember = async (workspaceId, requesterId, { email, role }) => {
  const requesterMembership = await WorkspaceMember.findOne({
    workspaceId,
    userId: requesterId,
  }).lean();

  if (!requesterMembership) {
    const error = new Error("You are not a member of this workspace");
    error.statusCode = 403;
    throw error;
  }

  if (requesterMembership.role !== "OWNER") {
    const error = new Error("Only the workspace owner can invite members");
    error.statusCode = 403;
    throw error;
  }

  const inviteRole = role || "EDITOR";

  if (!INVITABLE_ROLES.includes(inviteRole)) {
    const error = new Error(`role must be one of ${INVITABLE_ROLES.join(", ")}`);
    error.statusCode = 400;
    throw error;
  }

  let invitedUser;

  try {
    const response = await axios.post(
      `${process.env.AUTH_SERVICE}/auth/find-by-email`,
      { email }
    );

    invitedUser = response.data.user;
  } catch (axiosError) {
    const status = axiosError.response?.status || 500;
    const message =
      axiosError.response?.data?.message || "Failed to look up that email";

    const error = new Error(message);
    error.statusCode = status;
    throw error;
  }

  const existingMembership = await WorkspaceMember.findOne({
    workspaceId,
    userId: invitedUser._id,
  }).lean();

  if (existingMembership) {
    const error = new Error("This user is already a member of this workspace");
    error.statusCode = 409;
    throw error;
  }

  const member = await WorkspaceMember.create({
    workspaceId,
    userId: invitedUser._id,
    role: inviteRole,
  });

  return {
    userId: member.userId,
    role: member.role,
    joinedAt: member.createdAt,
    name: invitedUser.name,
    email: invitedUser.email,
  };
};