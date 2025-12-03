// backend/tests/services/room.service.test.js
const roomService = require('../../services/room.service');
const Room = require('../../models/room');
const NodeCache = require('node-cache');

// Mock dependencies
jest.mock('../../models/room');
jest.mock('node-cache');

describe('Room Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllRoomNames', () => {
        it('should return cached rooms if available', async () => {
            const mockCachedRooms = ['General', 'Random'];
            NodeCache.prototype.get.mockReturnValue(mockCachedRooms);

            const result = await roomService.getAllRoomNames();

            expect(result).toEqual(mockCachedRooms);
            expect(Room.find).not.toHaveBeenCalled();
        });

        it('should fetch from db if cache miss', async () => {
            NodeCache.prototype.get.mockReturnValue(undefined);
            const mockRooms = [{ name: 'General' }, { name: 'Tech' }];
            Room.find.mockReturnValue({
                lean: jest.fn().mockResolvedValue(mockRooms)
            });

            const result = await roomService.getAllRoomNames();

            expect(result).toEqual(['General', 'Tech']);
            expect(Room.find).toHaveBeenCalled();
            expect(NodeCache.prototype.set).toHaveBeenCalledWith('allRooms', ['General', 'Tech']);
        });
    });

    describe('userHasAccess', () => {
        it('should return false if room does not exist', async () => {
            Room.findOne.mockResolvedValue(null);

            const result = await roomService.userHasAccess('NonExistent', 'user1');

            expect(result.hasAccess).toBe(false);
            expect(result.error).toBe('Room does not exist');
        });

        it('should return false if user is not allowed', async () => {
            const mockRoom = { name: 'Private', allowedUsers: ['admin'] };
            Room.findOne.mockResolvedValue(mockRoom);

            const result = await roomService.userHasAccess('Private', 'user1');

            expect(result.hasAccess).toBe(false);
        });

        it('should return true if user is allowed', async () => {
            const mockRoom = { name: 'General', allowedUsers: ['user1', 'user2'] };
            Room.findOne.mockResolvedValue(mockRoom);

            const result = await roomService.userHasAccess('General', 'user1');

            expect(result.hasAccess).toBe(true);
            expect(result.room).toEqual(mockRoom);
        });
    });
});
