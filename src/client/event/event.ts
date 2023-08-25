export abstract class ChainvizEvent {
    static readonly SUBSTRATE_API_READY = 'event.substrate_event_ready';
    static readonly SUBSTRATE_API_CONNECTION_TIMED_OUT = 'event.substrate_api_connection_timed_out';
    static readonly NETWORK_STATUS_SERVICE_CONNECTED = 'event.network_status_service_connected';
    static readonly NETWORK_STATUS_SERVICE_SUBSCRIBED = 'event.network_status_service_subscribed';
    static readonly NETWORK_STATUS_SERVICE_UNSUBSCRIBED =
        'event.network_status_service_unsubscribed';
    static readonly NETWORK_STATUS_SERVICE_DISCONNECTED =
        'event.network_status_service_disconnected';
    static readonly NETWORK_STATUS_SERVICE_ERROR = 'event.network_status_service_error';
    static readonly NETWORK_STATUS_UPDATE = 'event.network_status_update';
    static readonly ACTIVE_VALIDATOR_LIST_SERVICE_CONNECTED =
        'event.active_validator_list_service_connected';
    static readonly ACTIVE_VALIDATOR_LIST_SERVICE_SUBSCRIBED =
        'event.active_validator_list_service_subscribed';
    static readonly ACTIVE_VALIDATOR_LIST_SERVICE_UNSUBSCRIBED =
        'event.active_validator_list_service_unsubscribed';
    static readonly ACTIVE_VALIDATOR_LIST_SERVICE_DISCONNECTED =
        'event.active_validator_list_service_disconnected';
    static readonly ACTIVE_VALIDATOR_LIST_SERVICE_ERROR =
        'event.active_validator_list_service_error';
    static readonly ACTIVE_VALIDATOR_LIST_INITIALIZED = 'event.active_validator_list_initialized';
    static readonly ACTIVE_VALIDATOR_LIST_ADDED = 'event.active_validator_list_added';
    static readonly ACTIVE_VALIDATOR_LIST_UPDATED = 'event.active_validator_list_updated';
    static readonly ACTIVE_VALIDATOR_LIST_REMOVED = 'event.active_validator_list_removed';
    static readonly NEW_BLOCK = 'event.new_block';
    static readonly FINALIZED_BLOCK = 'event.finalized_block';
    static readonly DISCARDED_BLOCK = 'event.discarded_block';
    static readonly NETWORK_SELECTED = 'event.network_selected';
    static readonly NEW_XCM_TRANSFER = 'event.new_xcm_transfer';
    static readonly XCM_TRANSFERS_DISCARDED = 'event.xcm_transfers_discarded';
}
