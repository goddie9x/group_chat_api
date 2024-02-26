module.exports = (io) => {
    const createNotifDone = () => {
        io.emit('notif:created', {
            type: 'success',
            message: 'Create schedule successfully',
        });
    };
    return {
        createNotifDone,
    };
}