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
    static readonly ACTIVE_VALIDATOR_LIST_UPDATE = 'event.active_validator_list_update';
    static readonly NEW_BLOCK = 'event.new_block';
    static readonly NEW_FINALIZED_BLOCK = 'event.new_finalized_block';
    static readonly NEW_XCM_MESSAGE = 'event.new_xcm_message';
    static readonly NETWORK_SELECTED = 'event.network_selected';
}
