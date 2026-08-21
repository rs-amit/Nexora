import Room from "../models/room.model.js";
import RoomMember from "../models/room-member.model.js";
import WorkspaceMember from "../models/workspace-membe.model.js";

const assertWorkspaceMembership = async (workspaceId, userId) => {
  const membership = await WorkspaceMember.findOne({
    workspaceId,
    userId,
  }).lean();

  if (!membership) {
    const error = new Error("You are not a member of this workspace");
    error.statusCode = 403;
    throw error;
  }

  return membership;
};

const notFoundError = () => {
  const error = new Error("Room not found");
  error.statusCode = 404;
  return error;
};

const assertRoomAccess = async (room, userId) => {
  if (room.visibility !== "RESTRICTED") return;

  const roomMembership = await RoomMember.findOne({
    roomId: room._id,
    userId,
  }).lean();

  if (!roomMembership) {
    throw notFoundError();
  }
};

const assertCanManageRoomMembers = (room, requesterMembership, requesterId) => {
  const isWorkspaceOwner = requesterMembership.role === "OWNER";
  const isRoomCreator = room.createdBy.toString() === requesterId.toString();

  if (!isWorkspaceOwner && !isRoomCreator) {
    const error = new Error(
      "Only the workspace owner or the room creator can manage room members"
    );
    error.statusCode = 403;
    throw error;
  }
};

export const createRoom = async ({
  workspaceId,
  name,
  description,
  userId,
}) => {
  await assertWorkspaceMembership(workspaceId, userId);

  const room = await Room.create({
    workspaceId,
    name,
    description,
    createdBy: userId,
  });

  return room;
};

export const getRoomsByWorkspace = async (workspaceId, userId) => {
  await assertWorkspaceMembership(workspaceId, userId);

  const rooms = await Room.find({ workspaceId })
    .sort({ createdAt: -1 })
    .lean();

  const restrictedRoomIds = rooms
    .filter((room) => room.visibility === "RESTRICTED")
    .map((room) => room._id);

  if (restrictedRoomIds.length === 0) {
    return rooms;
  }

  const accessibleRoomMemberships = await RoomMember.find({
    roomId: { $in: restrictedRoomIds },
    userId,
  }).lean();

  const accessibleRestrictedRoomIds = new Set(
    accessibleRoomMemberships.map((membership) => membership.roomId.toString())
  );

  return rooms.filter(
    (room) =>
      room.visibility !== "RESTRICTED" ||
      accessibleRestrictedRoomIds.has(room._id.toString())
  );
};

export const getRoomById = async (roomId, userId) => {
  const room = await Room.findById(roomId).lean();

  if (!room) {
    throw notFoundError();
  }

  await assertWorkspaceMembership(room.workspaceId, userId);
  await assertRoomAccess(room, userId);

  return room;
};

export const getRoomMembers = async (roomId, userId) => {
  const room = await Room.findById(roomId).lean();

  if (!room) {
    throw notFoundError();
  }

  await assertWorkspaceMembership(room.workspaceId, userId);
  await assertRoomAccess(room, userId);

  if (room.visibility === "OPEN") {
    const workspaceMembers = await WorkspaceMember.find({
      workspaceId: room.workspaceId,
    }).lean();

    return {
      roomId: room._id,
      workspaceId: room.workspaceId,
      visibility: room.visibility,
      members: workspaceMembers.map((member) => ({
        userId: member.userId,
        role: member.role,
        joinedAt: member.createdAt,
      })),
    };
  }

  const roomMembers = await RoomMember.find({ roomId }).lean();
  const memberUserIds = roomMembers.map((member) => member.userId);

  const workspaceMembers = await WorkspaceMember.find({
    workspaceId: room.workspaceId,
    userId: { $in: memberUserIds },
  }).lean();

  const roleByUserId = new Map(
    workspaceMembers.map((member) => [member.userId.toString(), member.role])
  );

  return {
    roomId: room._id,
    workspaceId: room.workspaceId,
    visibility: room.visibility,
    members: roomMembers.map((member) => ({
      userId: member.userId,
      role: roleByUserId.get(member.userId.toString()) ?? "VIEWER",
      joinedAt: member.createdAt,
    })),
  };
};

export const addRoomMember = async (roomId, requesterId, targetUserId) => {
  const room = await Room.findById(roomId);

  if (!room) {
    throw notFoundError();
  }

  const requesterMembership = await assertWorkspaceMembership(
    room.workspaceId,
    requesterId
  );

  assertCanManageRoomMembers(room, requesterMembership, requesterId);

  const targetMembership = await WorkspaceMember.findOne({
    workspaceId: room.workspaceId,
    userId: targetUserId,
  }).lean();

  if (!targetMembership) {
    const error = new Error(
      "User must be a member of the workspace before being added to a room"
    );
    error.statusCode = 400;
    throw error;
  }

  if (room.visibility === "OPEN") {
    const workspaceMembers = await WorkspaceMember.find({
      workspaceId: room.workspaceId,
    }).lean();

    room.visibility = "RESTRICTED";
    await room.save();

    await RoomMember.insertMany(
      workspaceMembers.map((member) => ({
        roomId: room._id,
        userId: member.userId,
        addedBy: requesterId,
      })),
      { ordered: false }
    ).catch(() => {});
  } else {
    const existing = await RoomMember.findOne({
      roomId,
      userId: targetUserId,
    }).lean();

    if (existing) {
      const error = new Error("This user is already a member of this room");
      error.statusCode = 409;
      throw error;
    }

    await RoomMember.create({
      roomId,
      userId: targetUserId,
      addedBy: requesterId,
    });
  }

  return {
    userId: targetUserId,
    role: targetMembership.role,
    joinedAt: new Date(),
  };
};

export const removeRoomMember = async (roomId, requesterId, targetUserId) => {
  const room = await Room.findById(roomId);

  if (!room) {
    throw notFoundError();
  }

  const requesterMembership = await assertWorkspaceMembership(
    room.workspaceId,
    requesterId
  );

  assertCanManageRoomMembers(room, requesterMembership, requesterId);

  if (room.visibility === "OPEN") {
    const workspaceMembers = await WorkspaceMember.find({
      workspaceId: room.workspaceId,
      userId: { $ne: targetUserId },
    }).lean();

    room.visibility = "RESTRICTED";
    await room.save();

    await RoomMember.insertMany(
      workspaceMembers.map((member) => ({
        roomId: room._id,
        userId: member.userId,
        addedBy: requesterId,
      })),
      { ordered: false }
    ).catch(() => {});
  } else {
    await RoomMember.deleteOne({ roomId, userId: targetUserId });
  }

  return { success: true };
};
