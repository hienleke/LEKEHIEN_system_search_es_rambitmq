const Exchange = {
    NOTIFICATION: {
        NAME: 'notification_topic',
        TYPE: 'topic',
        DEAD_LETTER: {
            NAME: 'dead_letter',
            TYPE: 'topic',
        },
    },
};

const RoutingKey = {
    NOTIFICATION: {
        SEARCH_RESULT: 'notification.search_result',
    },
};

const Queue = {
    NOTIFICATION: {
        SEARCH: 'queue_search',
        DEAD_LETTER: 'queue_search_dead_letter',
    },
};

module.exports = {
    Exchange,
    RoutingKey,
    Queue,
};
