import pick from 'lodash/pick';
import * as types from './mutation_types';
import { mapToDashboardViewModel, normalizeQueryResult } from './utils';
import { BACKOFF_TIMEOUT } from '../../lib/utils/common_utils';
import { endpointKeys, initialStateKeys, metricStates } from '../constants';
import httpStatusCodes from '~/lib/utils/http_status';

/**
 * Locate and return a metric in the dashboard by its id
 * as generated by `uniqMetricsId()`.
 * @param {String} metricId Unique id in the dashboard
 * @param {Object} dashboard Full dashboard object
 */
const findMetricInDashboard = (metricId, dashboard) => {
  let res = null;
  dashboard.panelGroups.forEach(group => {
    group.panels.forEach(panel => {
      panel.metrics.forEach(metric => {
        if (metric.metricId === metricId) {
          res = metric;
        }
      });
    });
  });
  return res;
};

/**
 * Maps a backened error state to a `metricStates` constant
 * @param {Object} error - Error from backend response
 */
const emptyStateFromError = error => {
  if (!error) {
    return metricStates.UNKNOWN_ERROR;
  }

  // Special error responses
  if (error.message === BACKOFF_TIMEOUT) {
    return metricStates.TIMEOUT;
  }

  // Axios error responses
  const { response } = error;
  if (response && response.status === httpStatusCodes.SERVICE_UNAVAILABLE) {
    return metricStates.CONNECTION_FAILED;
  } else if (response && response.status === httpStatusCodes.BAD_REQUEST) {
    // Note: "error.response.data.error" may contain Prometheus error information
    return metricStates.BAD_QUERY;
  }

  return metricStates.UNKNOWN_ERROR;
};

export default {
  /**
   * Dashboard panels structure and global state
   */
  [types.REQUEST_METRICS_DASHBOARD](state) {
    state.emptyState = 'loading';
    state.showEmptyState = true;
  },
  [types.RECEIVE_METRICS_DASHBOARD_SUCCESS](state, dashboard) {
    state.dashboard = mapToDashboardViewModel(dashboard);

    if (!state.dashboard.panelGroups.length) {
      state.emptyState = 'noData';
    }
  },
  [types.RECEIVE_METRICS_DASHBOARD_FAILURE](state, error) {
    state.emptyState = error ? 'unableToConnect' : 'noData';
    state.showEmptyState = true;
  },

  /**
   * Deployments and environments
   */
  [types.RECEIVE_DEPLOYMENTS_DATA_SUCCESS](state, deployments) {
    state.deploymentData = deployments;
  },
  [types.RECEIVE_DEPLOYMENTS_DATA_FAILURE](state) {
    state.deploymentData = [];
  },
  [types.REQUEST_ENVIRONMENTS_DATA](state) {
    state.environmentsLoading = true;
  },
  [types.RECEIVE_ENVIRONMENTS_DATA_SUCCESS](state, environments) {
    state.environmentsLoading = false;
    state.environments = environments;
  },
  [types.RECEIVE_ENVIRONMENTS_DATA_FAILURE](state) {
    state.environmentsLoading = false;
    state.environments = [];
  },

  /**
   * Annotations
   */
  [types.RECEIVE_ANNOTATIONS_SUCCESS](state, annotations) {
    state.annotations = annotations;
  },
  [types.RECEIVE_ANNOTATIONS_FAILURE](state) {
    state.annotations = [];
  },

  /**
   * Individual panel/metric results
   */
  [types.REQUEST_METRIC_RESULT](state, { metricId }) {
    const metric = findMetricInDashboard(metricId, state.dashboard);
    metric.loading = true;
    if (!metric.result) {
      metric.state = metricStates.LOADING;
    }
  },
  [types.RECEIVE_METRIC_RESULT_SUCCESS](state, { metricId, result }) {
    const metric = findMetricInDashboard(metricId, state.dashboard);
    metric.loading = false;
    state.showEmptyState = false;

    if (!result || result.length === 0) {
      metric.state = metricStates.NO_DATA;
      metric.result = null;
    } else {
      const normalizedResults = result.map(normalizeQueryResult);

      metric.state = metricStates.OK;
      metric.result = Object.freeze(normalizedResults);
    }
  },
  [types.RECEIVE_METRIC_RESULT_FAILURE](state, { metricId, error }) {
    const metric = findMetricInDashboard(metricId, state.dashboard);

    metric.state = emptyStateFromError(error);
    metric.loading = false;
    metric.result = null;
  },
  [types.SET_INITIAL_STATE](state, initialState = {}) {
    Object.assign(state, pick(initialState, initialStateKeys));
  },
  [types.SET_ENDPOINTS](state, endpoints = {}) {
    Object.assign(state, pick(endpoints, endpointKeys));
  },
  [types.SET_TIME_RANGE](state, timeRange) {
    state.timeRange = timeRange;
  },
  [types.SET_GETTING_STARTED_EMPTY_STATE](state) {
    state.emptyState = 'gettingStarted';
  },
  [types.SET_NO_DATA_EMPTY_STATE](state) {
    state.showEmptyState = true;
    state.emptyState = 'noData';
  },
  [types.SET_ALL_DASHBOARDS](state, dashboards) {
    state.allDashboards = dashboards || [];
  },
  [types.SET_SHOW_ERROR_BANNER](state, enabled) {
    state.showErrorBanner = enabled;
  },
  [types.SET_PANEL_GROUP_METRICS](state, payload) {
    const panelGroup = state.dashboard.panelGroups.find(pg => payload.key === pg.key);
    panelGroup.panels = payload.panels;
  },
  [types.SET_ENVIRONMENTS_FILTER](state, searchTerm) {
    state.environmentsSearchTerm = searchTerm;
  },
};
